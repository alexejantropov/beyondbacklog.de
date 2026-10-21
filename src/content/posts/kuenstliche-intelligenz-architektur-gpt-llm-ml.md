---
title: Alles KI oder was?
subtitle: "GPTs, LLMs und ML: Ein Erklärbär-Artikel zum Verstehen und Mitreden über die wichtigsten Begriffe rund um die Architektur der Künstlichen Intelligenz."
eyebrow: Erklärbär
date: 2024-07-12T15:48:55.450Z
lang: de
tags:
  - ki
cover: ~/assets/posts/kuenstliche-intelligenz-architektur-gpt-llm-ml/20d2ad43-7e3f-4b7e-bc28-485dd0f4dc42_2268x1763.webp
coverAlt: ""
substackId: 146395566
---

Die Welt der Künstlichen Intelligenz (KI) ist voll von Fachbegriffen und Abkürzungen wie GPTs, LLMs oder ML. Heute daher ein Erklärbär-Artikel zur Einordnung. Die Zusammenhänge verstehen ist besonders wichtig, wenn man, wie ich, seine berufliche Heimat in der Produktentwicklung hat. Und wenn nicht, kann man zumindest in der Kaffeeküche mitreden :-)

![](~/assets/posts/kuenstliche-intelligenz-architektur-gpt-llm-ml/20d2ad43-7e3f-4b7e-bc28-485dd0f4dc42_2268x1763.webp)

Das, was wir als Anwender kennen und sehen sind Tools wie [ChatGPT](https://chatgpt.com/), [Gemini](https://gemini.google.com/) und [Claude](https://claude.ai/). Heute tauchen wir in die unsichtbare Welt der Technologie hinter diesen Tools ab.

## **KI-Anwendungen**

[ChatGPT](https://chatgpt.com/), [Gemini](https://gemini.google.com/) und [Claude](https://claude.ai/) sind Webanwendungen von OpenAI, Google und Anthropic, die es jedem von uns ermöglichen, mit der KI zu interagieren. Darüber hinaus gibt es zahlreiche weitere.

Obwohl solche Anwendungen wie eine dünne Schicht um die namensgebenden Large Language Models erscheinen, steckt oft mehr dahinter. So muss ChatGPT mit denselben Einschränkungen wie das Modell darunter GPT-4o umgehen, z.B. KI-Halluzinationen. Die Anwendungsschicht bietet jedoch mehr Möglichkeiten, diese Einschränkungen zu mildern, indem Regeln und Filter festgelegt werden, um Antworten innerhalb bestimmter Parameter oder erwarteter Ergebnisse zu halten. Das nennt man „Alignment“.

Das Wichtigste: Lass dich nicht verwirren, wenn du es mal hörst: Es gibt kein ChatGPT-4. Es gibt nur ChatGPT (die Webanwendung) oder GPT-4 (das Modell).

Nun tauchen wir tiefer in die Architektur ein.

## **Generative Pre-Trained Transformers (GPT)**

Generative Pre-trained Transformers (GPT) sind Sprachmodelle, die mithilfe der 2017 eingeführten Transformer-Architektur eigenständig Texte, Bilder, Videos und Musik erstellen und abändern können. Bei ChatGPT steckt diese Technologie im Namen - nur falls du dich das mal gefragt hast.

GPTs durchlaufen ein intensives Training aus einer Unmenge an Daten, primär aus dem Internet. Dabei lernen sie die Muster und Strukturen von z.B. Sprache so gut kennen, dass sie nahezu perfekte Texte generieren können. Gleiches gilt für Bilder, Videos und Musik.

Doch ein kleiner Haken bleibt: Diese Modelle verstehen Texte nicht wie wir Menschen. Statt echtem Verständnis erkennen sie nur statistische Muster in den Daten. Das ist beeindruckend, aber nicht dasselbe wie menschliches Denken.

## **Large Language Models (LLMs)**

GPT ist **ein** möglicher Typ von Large Language Models (LLM). Weitere bekannte und leistungsstarke LLMs wie Claude 3.5, Gemini 1.5 Pro, Llama 3 und Mistral Large sind keine GPTs im engeren Sinne. Sie verwenden möglicherweise ähnliche Technologien oder Prinzipien, haben aber ihre eigenen spezifischen Architekturen und Trainingsmethoden.

LLMs haben kein echtes Sprachverständnis. Ihre Antworten basieren auf Mustern aus dem Training, nicht auf inhärentem Wissen oder Verständnis der Welt. In den letzten Jahren gab es immense Anstrengungen in der Entwicklung von LLMs, sowohl kommerziell als auch durch Open-Source. Die Tools wie [ChatGPT](https://chat.openai.com/), [Midjourney](http://www.midjourney.com/), [Perplexity.ai](https://www.perplexity.ai/) und [Claude.ai](https://claude.ai/) - um nur einige bekannte zu nennen - sind das anfassbare Ergebnis dieser Anstrengungen.

### Unterschiede zwischen LLM und GPT

Während alle GPT-Modelle auf der Transformer-Architektur basieren, können andere LLMs unterschiedliche Architekturen verwenden. Außerdem sind GPT-Modelle tendenziell für allgemeinere Anwendungen konzipiert. Large Language Models (LLMs) können dagegen, müssen jedoch nicht, oft für spezifische Aufgaben oder Domänen optimiert sein.

LLMs werden ebenfalls auf umfangreichen Textdaten trainiert und können Inhalte wie ein Mensch generieren. Sie erkennen Muster in Daten und nutzen diese, um relevante Antworten zu geben. So ist z.B. [BERT](https://huggingface.co/docs/transformers/model_doc/bert) ein weithin anerkanntes LLM, das 2018 von Google entwickelt wurde und große Anerkennung für die Beantwortung von Fragen und die Sentimentanalyse erhielt. Dieses LLM nutzt zwar ebenfalls die Tansformer-Architektur ist jedoch kein GPT:

-   BERT ist primär für das Verstehen von Sprache und Kontextanalyse konzipiert, während GPT auf die Generierung von menschenähnlichem Text ausgelegt ist
    
-   BERT verarbeitet Text in beide Richtungen, um den Kontext besser zu erfassen, während GPT Text sequenziell von links nach rechts verarbeitet
    

### **Parameter bei LLMs**

Die modernen LLMs haben Millionen oder Milliarden Parameter und können Fragen beantworten, Essays schreiben, Dokumente zusammenfassen, Sprachen übersetzen, Code, Bilder, Videos, Musik generieren und vieles mehr.

Parameter sind dabei die Werte, die während des Trainings eines Modells angepasst werden, um das Modell so gut wie möglich an die gegebenen Daten anzupassen. Einfach gesagt: Parameter bestimmen, wie das Modell Daten verarbeitet und welche Ausgabe es erzeugt. Diese Werte werden durch den Trainingsprozess iterativ angepasst, um Fehler zu minimieren.

> Parameter sind wie Megapixel bei Kameras: je größer die Zahl, desto mehr Details.

Parameter sind damit das Herzstück des Lernprozesses in KI-Modellen. Sie machen den Unterschied zwischen einem einfachen, ungenauen Modell und einem hoch entwickelten System aus, das erstaunlich präzise und nützliche Vorhersagen treffen kann.

## **Generative KI**

Generative KI erzeugt oder verändert Inhalte durch Nutzung statistischer Muster in Daten. Es geht dabei also nicht um Kreativität im menschlichen Sinne. Ein bekanntes Beispiel dafür sind Deepfakes, bei denen visuelle und auditive Inhalte so manipuliert werden, dass sie täuschend echt wirken.

![deep fake videos revolution](~/assets/posts/kuenstliche-intelligenz-architektur-gpt-llm-ml/daafa8d8-db60-44f1-af2c-294e3d505c9a_1356x762.webp)
*Papst Franziskus im römischen Tanzclub „Magic Fly“ (2017) | © Deepfake: Pavel Sokolov, entnommen aus filmpuls.info/deepfake-film-video/*

Der Hype um generative KI begann 2014 mit der Einführung der Generative Adversarial Networks (GANs) durch Ian Goodfellow. Diese Netzwerke trugen zur Forschung bei und wurden später in 2017 durch die Transformer-Modelle von Google ergänzt.

Generative KI ist ein sehr faszinierender Bereich des Deep Learning und darum geht es als Nächstes.

## **Deep Learning**

Deep Learning basiert auf künstlichen neuronalen Netzen (KNN), die aus vielen künstlichen Neuronen bestehen. Diese sind miteinander verbunden und in der Regel in Schichten organisiert. Deshalb der Begriff „deep“. Im Bild zeigt jeder Kreis ein künstliches Neuron und jeder Pfeil eine Verbindung zwischen zwei künstlichen Neuronen.

![undefined](~/assets/posts/kuenstliche-intelligenz-architektur-gpt-llm-ml/7476262d-4bae-4ac2-9473-4499d3918c0b_1280x1540.webp)
*Schema eines künstlichen neuronalen Netzes, aus Wikipedia.*

Obwohl die Idee der KNN vom menschlichen Gehirn inspiriert ist, funktionieren sie anders als die biologischen Prozesse. Die KNN sind hoch entwickelte Mustererkennungssysteme und nicht mit bewussten Wesen zu verwechseln.

Deep Learning spielt eine Schlüsselrolle bei vielen modernen Anwendungen, wie der Spracherkennung, Bildverarbeitung und autonomen Fahrzeugen. Technologisch betrachtet handelt es sich bei Deep Learning um einen speziellen Bereich des maschinellen Lernens.

## **Maschinelles Lernen (ML)**

Es gibt zwei Wege, wie Systeme intelligent werden können:

-   Die eine Methode nutzt vorprogrammierte Regeln für Entscheidungen – regelbasierte Systeme folgen starr den Vorgaben des Entwicklers, ohne aus neuen Daten zu lernen.
    
-   Die zweite Methode, und hier wird es spannend, setzt auf das Lernen aus Daten: Das ist Maschinelles Lernen (ML).
    

ML erlaubt es Systemen, aus großen Datenmengen zu lernen und Muster zu erkennen, um Entscheidungen ohne menschliches Zutun zu treffen. Anders als oft in Filmen dargestellt, bedeutet ML nicht, dass die Systeme ein Bewusstsein oder Emotionen entwickeln. Es handelt sich vielmehr um einen statistischen Ansatz.

Ob bei der Vorhersage von Kundenverhalten, der Erkennung von Betrugsmustern oder der personalisierten Werbung – ML revolutioniert viele Bereiche unseres Lebens und Arbeitens, ohne dass wir es direkt merken.

## **Starke KI (AGI) und Schwache KI**

Bei der Starken KI haben die Forscher es zum Ziel, die gesamte Bandbreite menschlicher Intelligenz nachzubilden. Das heißt, sie soll denken, lernen und Probleme lösen können wie ein Mensch – auch solche, die vorher unbekannt sind. Im Idealfall führt das zu einer Superintelligenz, welche die menschliche Intelligenz übertrifft. Dieses potentielle Ereignis wird als Singularität bezeichnet. Experten sind sich jedoch einig, dass wir von diesem Szenario noch weit entfernt sind und ob wir es überhaupt jemals erreichen, darüber scheiden sich die Geister. Starke KI ist damit heute eine theoretische Form der KI.

Schwache KI ist spezialisierter, begegnet uns heute im Alltag und erscheint mit Modellen wie GPT-4 oder Claude 3.5 gar nicht so schwach. Sie wird für bestimmte Aufgaben entwickelt, wie Sprachübersetzungen oder Bilderkennung, und hat nicht den Anspruch, menschliche Intelligenz vollständig nachzuahmen.

Doch, was ist Künstliche Intelligenz überhaupt?

## **Künstliche Intelligenz**

Künstliche Intelligenz (KI) klingt nach Science-Fiction, ist es aber nicht. Es geht darum, Maschinen so zu programmieren, dass sie Aufgaben übernehmen, die normalerweise menschliche Intelligenz erfordern – wie Lernen, Problemlösen und Entscheidungen treffen.

Der Begriff KI wurde in den 1950er Jahren geprägt und hatte seine ersten Anwendungen im militärischen Bereich - wie so häufig bei neuen Technologien. Seither hat sich das Feld enorm weiterentwickelt und durchdringt mittlerweile zahlreiche Branchen.

## **Fazit**

Ich hoffe, ich konnte einen guten Überblick über wichtige KI-Konzepte ohne Anspruch auf wissenschaftliche Vollständigkeit und Korrektheit geben. Denn die Verwendung einiger Begriffe variiert, je nachdem, mit welchem Experten man spricht.

Es lohnt sich m.E. in der Kaffeeküche im Zweifel nicht auf korrekte Terminologie zu beharren. Wichtiger ist es, das große Ganze der Technologie zu verstehen und noch wichtiger: anwenden und dann darüber reden!

Mein Tipp: Beginne mit [Claude.ai](https://claude.ai/), dem heute leistungsfähigsten Modell. Lass dir bei den täglichen Aufgaben helfen. Wenn du schon soweit bist, dann überlege doch im Team ein kleines KI-Projekt zur gemeinsamen Nutzung, um erste Erfahrungen mit KI in einer Rolle als Team-Mitglied zu sammeln.

Inspiration für Produkt- und Softwareentwicklung findest du in meinem Artikel:

→ [KI ist nicht nur ChatGPT](/p/ki-ist-nicht-nur-chatgpt-archetypen-der-ki)

Also, bleib dran & mach einfach!

<p class="signature">Alexej</p>

PS: wenn Du glaubst, das sollte noch jemand lesen oder hören, empfiehl meinen Newsletter gerne weiter. Tausend Dank dafür!

<p><a class="button" href="https://www.beyondbacklog.de/leaderboard">Einem Freund empfehlen</a></p>
