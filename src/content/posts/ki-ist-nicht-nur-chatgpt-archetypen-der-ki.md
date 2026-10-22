---
title: KI ist nicht nur ChatGPT
subtitle: "Mal ehrlich: sagst Du auch „KI“ und meinst damit „ChatGPT“? Ich bin ehrlich: Ich erwische mich dabei, diese zwei Begriffe als Synonym zu behandeln. Und das ist falsch! Also Zeit das mal auszubügeln."
eyebrow: Fünf Archetypen
date: 2024-07-01T18:31:07.887Z
lang: de
cover: ~/assets/posts/ki-ist-nicht-nur-chatgpt-archetypen-der-ki/ki-ist-nicht-nur-chatgpt-archetypen-der-ki-b8561108.webp
coverAlt: "Schaubild: Künstliche Intelligenz mit Generativer KI, Supervised ML, Computer Vision, Sprachverarbeitung und NLP"
substackId: 145788003
---

Ich möchte ein weitverbreitetes Missverständnis im allgemeinen Sprachgebrauch aus dem Weg räumen:

> Künstliche Intelligenz (KI) ist ChatGPT.

Diese Sichtweise greift jedoch zu kurz, denn KI ist eine weitreichende Technologie mit vielfältigen Anwendungsmöglichkeiten. ChatGPT mag derzeit der Promi unter KI-Anwendung sein, aber es ist keineswegs das Zentrum der KI. Es gibt auch andere Formen: [Tobias Zwingmann](https://blog.tobiaszwingmann.com/p/business-guide-nongenerative-ai-archetypes-beyond-chatgpt) unterscheidet fünf Archetypen von KI:

-   Generative KI
    
-   Supervised Machine Learning: überwachtes Lernen
    
-   Computer Vision: computerbasiertes Sehen
    
-   Natural Language Processing (NLP): Verarbeitung natürlicher Sprache
    
-   Audio-/Sprachverarbeitung
    

Ich möchte die o.g. Formen kurz vorstellen und als mögliche Werkzeuge speziell für den Einsatz in der Produkt- und Softwareentwicklung beleuchten, um spezifische Vorteile zu ziehen und so mehr Innovation voranzutreiben.

Und nun der Reihe nach…

## **Die 5 Archetypen von Künstlicher Intelligenz**

![5 Archetypen von KI](~/assets/posts/ki-ist-nicht-nur-chatgpt-archetypen-der-ki/ki-ist-nicht-nur-chatgpt-archetypen-der-ki-b8561108.webp)
*5 Archetypen von KI*

### **1) Generative KI**

Generative KI geht über ChatGPT hinaus und ermöglicht nicht nur die Textgenerierung, sondern auch die Erstellung und Verarbeitung von Bildern und Audiodaten. Der Vorteil von generativer KI ist, dass viele der spezifischen Fähigkeiten der anderen Formen der KI mit generativer KI bei zahlreichen Anwendungsfällen schon zu einem “good enough” Ergebnis führen können. Auf Grund der Einfachheit der Anwendung der generativen KI können so vergleichsweise schnell quick wins erzielt werden.

Nutze [ChatGPT](https://openai.com/chatgpt/), um anzufangen. Probiere jedoch auch andere generativen KI-Modelle wie z. B. [Claude.ai](https://claude.ai/) oder [Gemini](https://gemini.google.com/) aus.

#### **Wofür kannst Du generative KI in der Produkt- und Softwareentwicklung ausprobieren?**

-   **Code-Generierung:** Automatisches Erstellen von Codeschnipsel basierend auf natürlichen Spracheingaben. Zum Beispiel kann ein Entwickler eine natürliche Sprachbeschreibung eines gewünschten Codes eingeben, wie „Erstelle eine Funktion, die eine Liste sortiert“, und das generative KI-Modell erstellt das entsprechende Codeschnipsel in der gewünschten Programmiersprache, was die Effizienz und Produktivität der Entwickler erhöht. Viele Teams nutzen bereits die Integration von [GitHub Copilot](https://github.com/features/copilot) oder [Tabnine](https://www.tabnine.com/) unter anderem dafür.
    
-   **Prototypenerstellung:** Generierung von UI-Prototypen basierend auf textuellen Beschreibungen. Entwickler und Designer können einfache Textbeschreibungen der gewünschten Benutzeroberfläche eingeben, wie „Erstelle eine Login-Seite mit zwei Eingabefeldern und einem Anmeldebutton“, und das Modell generiert visuelle Prototypen, die als Grundlage für die weitere Entwicklung und das Design dienen können. Probiere dafür [Figma AI](https://www.figma.com/de-de/ai/) oder [Uizard.io](https://uizard.io/) aus.
    
-   **Testfall-Generierung:** Automatisiertes Erstellen von Testfällen basierend auf den Spezifikationen und Anforderungen des Softwareprojekts. Zum Beispiel kann das Modell auf Basis einer Beschreibung wie „Teste die Eingabefelder der Login-Seite auf SQL-Injection-Anfälligkeit“ entsprechende Testfälle erstellen. Dies hilft, die Testabdeckung zu erhöhen und sicherzustellen, dass die Software gründlich getestet wird, bevor sie produktiv ausgerollt wird.
    

### **2) Supervised Machine Learning**

Supervised Machine Learning erkennt Muster in strukturierten Datensätzen. Stell dir das wie eine aufgebohrte und komplexere Tabelle vor. Du kannst das Modell mit zahlreichen Datenpunkten (wie Nutzerinformationen, Nutzungsdaten verschiedener Features oder Log-Daten) sowie den korrekten Labels oder Zielvariablen versorgen, z. B. ob ein Nutzer das Produkt weiterempfiehlt, welche Features am häufigsten genutzt werden oder ob ein Fehler auftritt. Das Modell lernt daraus die Muster und Zusammenhänge in den Daten und kann so Vorhersagen für neue, unbekannte Daten machen.

Speziell bei eigenständiger Anwendung von Supervised Machine Learning ist es wichtig auf ethische Aspekte und den Datenschutz beim Training zu achten. Diese Modelle sind nur so gut wie die Daten, die sie trainieren, und könnten bei schlechter Datenqualität unzuverlässig sein.

#### **Was sind relevante Anwendungsfälle in der Produkt- und Softwareentwicklung?**

-   **Nutzerverhaltensanalyse:** Prognostizieren, welche Features am meisten genutzt werden und welche weniger wichtig sind. Zum Beispiel kann ein Modell durch die Analyse historischer Nutzerdaten vorhersagen, dass ein neues Feature besonders bei einer bestimmten Nutzergruppe beliebt sein wird. Dies kann Produktteams helfen, Ressourcen gezielt auf die Entwicklung und Verbesserung der am meisten genutzten Features zu konzentrieren und weniger genutzte Features eventuell zu überdenken oder zu entfernen.
    
-   **Churn-Vorhersage:** Vorhersagen, welche Nutzer basierend auf ihrem Verhalten wahrscheinlich die Produktnutzung einstellen werden. Das Modell könnte Muster erkennen, die typisch für Nutzer sind, welche das Produkt bald nicht mehr nutzen werden, wie z. B. eine abnehmende Nutzungshäufigkeit, negatives Feedback oder eine zunehmende Anzahl von Supportanfragen. Diese Informationen ermöglichen es dem Unternehmen, proaktiv Kundenbindungsmaßnahmen zu ergreifen. Für die Churn-Vorhersage eignen sich besonders die Verfahren Random Forests oder Gradient Boosting.
    
-   **Fehlerprognose:** Vorhersagen, welche Teile des Codes oder welche Features wahrscheinlich Fehler enthalten. Durch die Analyse von Fehlerprotokollen und Nutzungsdaten kann das Modell erkennen, welche Bereiche des Produkts besonders fehleranfällig sind. Dies kann den Entwicklern ermöglichen, präventiv Maßnahmen zu ergreifen, um die Qualität des Produkts zu verbessern, indem sie diese kritischen Bereiche vor Release genauer überprüfen und testen.
    

### **3) Computer Vision**

Computer Vision analysiert Bilder statt Daten in Tabellen. Jedes Bild kann Millionen von Datenpunkten enthalten, da jedes Pixel und jede Farbe dem Modell Informationen liefern. Hier kommen häufig Deep-Learning-Technologien wie neuronale Netze zum Einsatz, die Muster und Merkmale in diesen Bildern erkennen können. Klingt kompliziert? Ja, schon, aber auch unerfahrene Teams können von vortrainierten Modellen und Bibliotheken profitieren, die vergleichsweise einfachen Start ermöglichen und kosteneffizient sind. Ein Blick lohnt sich z. B. auf [TensorFlow](https://www.tensorflow.org/) und [OpenCV](https://opencv.org/releases/). Auch hier ist jedoch die Arbeit für die Anpassung der vortrainierten Modelle mit spezifischen Trainingsdaten nicht zu unterschätzen.

#### **Typische Anwendungsbeispiele liegen im Product Design:**

-   **UI/UX-Analyse:** Erkennen von Nutzerinteraktionen und Mustern in Screenshots oder Videoaufnahmen der App-Nutzung. Computer Vision kann dafür genutzt werden, um zu analysieren, wie Benutzer mit verschiedenen Elementen der Benutzeroberfläche interagieren, welche Schaltflächen sie am häufigsten anklicken oder wie sie durch verschiedene Screens navigieren. Diese Informationen helfen dabei, die Benutzererfahrung zu verbessern und das Design zu optimieren.
    
-   **Visuelle Qualitätssicherung:** Automatisiertes Erkennen von Design- oder Implementierungsfehlern in UI-Elementen. So können Screenshots der Benutzeroberfläche auf Unstimmigkeiten überprüft werden, wie z. B. falsche Farben, verschobene Elemente oder fehlende Komponenten. Dies spart Zeit und Ressourcen im Vergleich zur manuellen Überprüfung und erhöht die Genauigkeit der Qualitätskontrollen.
    
-   **Automatisierte Designprüfung:** Überprüfung und Bewertung von Designelementen und deren Konsistenz mit Design-Richtlinien. Mit Computer Vision können Teams sicherstellen, dass alle visuellen Elemente einer Anwendung den festgelegten Designstandards entsprechen. Dies umfasst die Überprüfung von Schriftarten, Farben, Abständen und anderen visuellen Eigenschaften, um eine konsistente und ansprechende Benutzeroberfläche zu gewährleisten.
    

### **4) Natural Language Processing (NLP)**

NLP ermöglicht es Maschinen, menschliche Texte zu verstehen, zu interpretieren und zu generieren. Es zerlegt Texte in ihre grundlegenden Bausteine – Wörter, Phrasen und Sätze. NLP-Modelle nutzen verschiedene Techniken, um die Struktur, Bedeutung und den Kontext des Textes zu analysieren. Bekannteste Bibliotheken für den Start sind [spaCy](https://spacy.io/) und [NLTK](https://www.nltk.org/).

#### **Ideen für NLP-Anwendungen in der Produkt- und Softwareentwicklung:**

-   **Benutzerfeedback-Analyse:** Automatisierte Analyse von Nutzerbewertungen und -kommentaren, um häufige Probleme und Wünsche zu identifizieren. Zum Beispiel können NLP-Modelle Muster und Trends in Kundenfeedback erkennen, wie wiederkehrende Beschwerden über ein bestimmtes Feature oder häufige Anfragen nach einer neuen Funktion. Dies ermöglicht es Produktteams, gezielt Verbesserungen vorzunehmen und die Kundenzufriedenheit zu erhöhen.
    
-   **Dokumentationserstellung:** Automatisierte Generierung und Pflege von technischen Dokumentationen basierend auf Code-Kommentaren und Änderungsverläufen. Ein NLP-Modell kann Code-Kommentare analysieren und daraus verständliche Dokumentationen erstellen. Es kann auch automatisch Änderungen in der Codebasis erkennen und die Dokumentation entsprechend aktualisieren. Das hilft Entwicklern, Zeit zu sparen und sicherzustellen, dass die Dokumentation stets aktuell und präzise ist.
    
-   **Fehlerberichterstattung:** Automatisiertes Klassifizieren und Priorisieren von Fehlerberichten und Support-Tickets. NLP kann eingehende Fehlerberichte analysieren, die wichtigsten Probleme identifizieren und sie nach Dringlichkeit kategorisieren. Dies ermöglicht es Support-Teams, effizienter zu arbeiten, kritische Probleme schneller zu erkennen und zu beheben und die Gesamtqualität des Produkts zu verbessern.
    

### **5)** Audio-/Sprachverarbeitung

Sprach- und Audioverarbeitung ermöglicht Maschinen durch Anwendung von Sprachsynthese-Technologien, menschliche Sprache zu erkennen, zu interpretieren und zu generieren. Es ist ähnlich wie NLP, nur auf Audiodaten angewendet - oft indem Audio durch automatische Spracherkennung in Text umgewandelt wird. Für den Start lohnt sich ein Blick auf die Platzhirsche wie [Google Cloud Speech-to-Text](https://cloud.google.com/speech-to-text) und [Amazon Transcribe](https://aws.amazon.com/de/transcribe/).

#### **Mögliche Anwendungsfälle in der Produktentwicklung:**

-   **Meeting-Transkription:** Automatisches Transkribieren von Team-Meetings oder Kundeninterviews in durchsuchbaren Text. Dies erleichtert das Protokollieren und Nachverfolgen von besprochenen Produktentscheidungen und Aufgaben sowie von Insights aus Kundeninterviews. Teams können die Transkripte durchsuchen, um schnell relevante Informationen zu finden und zusammenzufassen, ohne die gesamten Audioaufnahmen durchzuhören.
    
-   **Echtzeit-Übersetzungen:** Bereitstellung von Echtzeit-Übersetzungen für multinationale Teams. Dies ermöglicht es Teams, in ihrer jeweiligen Muttersprache zu kommunizieren, wodurch Sprachbarrieren abgebaut und die Zusammenarbeit verbessert wird. Echtzeit-Übersetzungen können in Meetings, Chats oder sogar in der Benutzeroberfläche von Anwendungen integriert werden.
    

Zugegeben, mir fallen für die Sprachsynthese-Modelle keine dezidierten Anwendungsfälle speziell für Produkt- und Softwareentwicklung ein. Die genannten Anwendungsfälle sind für Teams jeglicher Funktionen in einem Unternehmen sowie team-übergreifend wertvoll.

## **Fazit**

KI ist ein weites Feld, das über ChatGPT hinausgeht. Jeder Archetyp der KI hat seine spezifischen Stärken und Limitationen. Die Wahl der richtigen KI-Technologie und deren kontinuierliche Evaluation sind entscheidend, um maximalen Nutzen für Stärkung der Innovationskraft in der Produkt- und Softwareentwicklung zu erzielen.

Und da die Entwicklung der Technologie rasant voranschreitet und die Anwendungsfelder Stück für Stück erschlossen werden, ist es spätestens jetzt an der Zeit, sich mit der Materie zu beschäftigen. Sonst steigt das Risiko durch andere in der Innovationsarbeit abgehängt zu werden.

In diesem Sinne, bleib dran und mach einfach!

<p class="signature">Alexej</p>

PS: wenn Du glaubst, das sollte noch jemand lesen oder hören, empfiehl meinen Newsletter gerne weiter. Tausend Dank dafür!

<p><a class="button" href="https://www.beyondbacklog.de/leaderboard">Einem Freund empfehlen</a></p>
