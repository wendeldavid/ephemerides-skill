package br.przygoda.ephemerides;

import com.amazon.ask.dispatcher.request.handler.HandlerInput;
import com.amazon.ask.dispatcher.request.handler.RequestHandler;
import com.amazon.ask.model.LaunchRequest;
import com.amazon.ask.model.Response;
import com.amazon.ask.request.Predicates;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.nodes.Node;
import org.jsoup.nodes.TextNode;
import org.jsoup.select.Elements;

import java.io.BufferedInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.URL;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.IntStream;

public class Ephemerides {

    final static String URL_BASE = "https://pt.wikipedia.org/wiki/";
    final static String[] months = {"janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"};

    static List<String> events = new ArrayList<>();
    static List<String> births = new ArrayList<>();
    static List<String> deaths = new ArrayList<>();
    static List<String> holydays = new ArrayList<>();

    static Stack<String> context = new Stack<>();

    public static void main(String[] args) {

        long start = System.currentTimeMillis();

        String ephemeride = getEphemeride();

        System.out.println("Aleatório-> " + ephemeride);

        long end = System.currentTimeMillis();

        System.out.println("Time: " + (end - start));

        System.out.println(Runtime.getRuntime().totalMemory());
    }

    public static String getEphemeride() {
        String out = null;
        try {
            out = loadFromWeb();
        } catch (IOException e) {
            e.printStackTrace();
            return "Não consegui lembrar de nada";
        }
//        String out = loadFromFile();

        Document doc = Jsoup.parse(out);

        Elements content = doc.select("div.mw-parser-output");

        iterateSection(content);

        ArrayList<String> all = new ArrayList<>(events.size() + births.size() + deaths.size() + holydays.size());
        all.addAll(events);
        all.addAll(births);
        all.addAll(deaths);
        all.addAll(holydays);

        int random = new Random().nextInt(all.size());

        return all.get(random);
    }

    private static void iterateSection(Elements content) {

        Element elements = content.first();
        elements.children().iterator().forEachRemaining(el -> {
            if ("h2".equals(el.tagName())) {
                String title = extractTitle(el);

                if (!context.empty()) {
                    context.pop();
                }

                context.push(title);

            } else if ("ul".equals(el.tagName())) {
                extractText(el);
            }
        });

        if ("debug".equals(System.getenv("loglevel"))) {
            System.out.println("Eventos Históricos");
            events.forEach(System.out::println);

            System.out.println("\n===============================================\n");
            System.out.println("Nscimentos");
            births.forEach(System.out::println);

            System.out.println("\n===============================================\n");
            System.out.println("Mortes");
            deaths.forEach(System.out::println);

            System.out.println("\n===============================================\n");
            System.out.println("\"Feriados e eventos cíclicos");
            holydays.forEach(System.out::println);
        }
    }

    private static String extractTitle(Element el) {
        return el.getElementsByClass("mw-headline").text();
    }

    private static void extractText(Element el) {
        Iterator<Element> iter = el.select("li").iterator();

        String ctx = context.peek();

        while (iter.hasNext()) {
            Element item = iter.next();

            if ("Eventos históricos".equals(ctx)) {
                events.add("Hoje em " + extractEphemerideText(item));
            } else if ("Nascimentos".equals(ctx)) {
                births.add("Aniversário de nacimento " + extractEphemerideText(item).replaceAll("\\(m\\.", ". ano de morte: "));
            } else if ("Mortes".equals(ctx)) {
                deaths.add("Aniversário de morte " + extractEphemerideText(item).replaceAll("\\(n\\.", " nascido em "));
            } else if ("Feriados e eventos cíclicos".equals(ctx)) {
                holydays.add(extractEphemerideText(item));
            }
        }
    }

    private static String extractEphemerideText(Element el) {
        StringBuilder sb = new StringBuilder();

        for (int i = 0; i < el.childNodeSize(); i++) {
            Node node = el.childNode(i);

            if (node instanceof TextNode) {
                TextNode item = (TextNode) node;
                sb.append(item.text());
            } else if (node instanceof Element) {
                Element item = (Element) node;
                sb.append(item.text());
            }
            sb.append(" ");
        }

        return sb.toString();
    }

    private static String loadFromFile() {
        StringBuilder sb = new StringBuilder();

        try (InputStream resource = ClassLoader.getSystemResourceAsStream("wiki.html");
             BufferedInputStream bis = new BufferedInputStream(resource);
             InputStreamReader isr = new InputStreamReader(bis);) {

            while (isr.ready()) {
                sb.append((char) isr.read());
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return sb.toString();
    }

    private static String loadFromWeb() throws IOException {
        int day = LocalDate.now().getDayOfMonth();
        String month = months[LocalDate.now().getMonthValue() - 1];

        URL urlDay = new URL(URL_BASE + day + "_de_" + month);

        return new Scanner(urlDay.openStream(), "UTF-8").useDelimiter("\\A").next();
    }

}
