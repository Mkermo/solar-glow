import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import ScrollReveal from "@/components/ScrollReveal";
import {
  ArrowRight,
  Leaf,
  PanelTop,
  Plug,
  Sun,
  Wrench,
  LifeBuoy,
  MessageCircle,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

type LocalizedString = {
  en: string;
  ar: string;
};

interface LearningTrack {
  id: string;
  title: LocalizedString;
  summary: LocalizedString;
  bullets: LocalizedString[];
  image: string;
  resources?: TrackResource[];
}

interface InstallationPhase {
  title: LocalizedString;
  description: LocalizedString;
  icon: React.ReactNode;
}

interface SustainabilityHighlight {
  title: LocalizedString;
  description: LocalizedString;
  icon: React.ReactNode;
}

interface MediaResource {
  title: LocalizedString;
  description: LocalizedString;
  image: string;
  href: string;
  type: "video" | "guide" | "case-study";
  source: string;
}

interface FaqItem {
  question: LocalizedString;
  answer: LocalizedString;
}

interface TrackResource {
  label: LocalizedString;
  href: string;
}

const makeLocalized = (en: string, ar?: string): LocalizedString => ({ en, ar: ar ?? en });

const learningTracks: LearningTrack[] = [
  {
    id: "basics",
    title: makeLocalized(
      "Solar Fundamentals",
      "\u0623\u0633\u0627\u0633\u064a\u0627\u062a \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629"
    ),
    summary: makeLocalized(
      "Understand how photovoltaic technology converts sunlight into electricity for homes and businesses.",
      "\u062a\u0639\u0631\u0651\u0641 \u0643\u064a\u0641 \u062a\u062d\u0648\u0651\u0644 \u0627\u0644\u062e\u0644\u0627\u064a\u0627 \u0627\u0644\u0643\u0647\u0631\u0648\u0636\u0648\u0626\u064a\u0629 \u0623\u0634\u0639\u0629 \u0627\u0644\u0634\u0645\u0633 \u0625\u0644\u0649 \u0643\u0647\u0631\u0628\u0627\u0621 \u064a\u0645\u0643\u0646 \u0627\u0633\u062a\u062e\u062f\u0627\u0645\u0647\u0627 \u0641\u064a \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0634\u0631\u0643\u0627\u062a."
    ),
    bullets: [
      makeLocalized(
        "Explore differences between monocrystalline, polycrystalline, and thin-film panels.",
        "\u0627\u0643\u062a\u0634\u0641 \u0627\u0644\u0641\u0631\u0648\u0642\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0623\u062d\u0627\u062f\u064a\u0629 \u0648\u0627\u0644\u0645\u062a\u0639\u062f\u062f\u0629 \u0627\u0644\u0628\u0644\u0648\u0631\u0627\u062a \u0648\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0623\u063a\u0634\u064a\u0629 \u0627\u0644\u0631\u0642\u064a\u0642\u0629."
      ),
      makeLocalized(
        "Learn how inverters and batteries create a balanced solar energy system.",
        "\u062a\u0639\u0631\u0651\u0641 \u0639\u0644\u0649 \u062f\u0648\u0631 \u0627\u0644\u0639\u0648\u0627\u0643\u0633 \u0648\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0627\u062a \u0641\u064a \u0628\u0646\u0627\u0621 \u0646\u0638\u0627\u0645 \u0637\u0627\u0642\u0629 \u0634\u0645\u0633\u064a\u0629 \u0645\u062a\u0643\u0627\u0645\u0644."
      ),
      makeLocalized(
        "Calculate energy yields using daily sun-hours and panel efficiency.",
        "\u0627\u062d\u0633\u0628 \u0627\u0644\u0625\u0646\u062a\u0627\u062c\u064a\u0629 \u0627\u0639\u062a\u0645\u0627\u062f\u0627\u064b \u0639\u0644\u0649 \u0633\u0627\u0639\u0627\u062a \u0627\u0644\u0625\u0634\u0639\u0627\u0639 \u0627\u0644\u0634\u0645\u0633\u064a \u0627\u0644\u064a\u0648\u0645\u064a\u0629 \u0648\u0643\u0641\u0627\u0621\u0629 \u0627\u0644\u0644\u0648\u062d."
      ),
    ],
    image:
      "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1200&q=80",
    resources: [
      {
        label: makeLocalized(
          "How do solar panels work? (TED-Ed)",
          "\u0643\u064a\u0641 \u062a\u0639\u0645\u0644 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0634\u0645\u0633\u064a\u0629\u061f (\u062a\u064a\u062f-\u0625\u062f)"
        ),
        href: "https://www.youtube.com/watch?v=xKxrkht7CpY",
      },
      {
        label: makeLocalized(
          "Solar Energy 101 (National Geographic)",
          "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 101 (\u0646\u0627\u0634\u064a\u0648\u0646\u0627\u0644 \u062c\u064a\u0648\u062c\u0631\u0627\u0641\u064a\u0643)"
        ),
        href: "https://www.youtube.com/watch?v=S6C637u8dT0",
      },
    ],
  },
  {
    id: "installation",
    title: makeLocalized(
      "Installation Masterclass",
      "\u062f\u0648\u0631\u0629 \u0627\u062d\u062a\u0631\u0627\u0641 \u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0623\u0646\u0638\u0645\u0629"
    ),
    summary: makeLocalized(
      "Step-by-step guidance for safe, code-compliant residential and commercial installations.",
      "\u0625\u0631\u0634\u0627\u062f\u0627\u062a \u0639\u0645\u0644\u064a\u0629 \u062e\u0637\u0648\u0629 \u0628\u062e\u0637\u0648\u0629 \u0644\u062a\u0631\u0643\u064a\u0628 \u0623\u0646\u0638\u0645\u0629 \u0622\u0645\u0646\u0629 \u0648\u0645\u062a\u0648\u0627\u0641\u0642\u0629 \u0645\u0639 \u0627\u0644\u0645\u0639\u0627\u064a\u064a\u0631 \u0644\u0644\u0645\u0646\u0627\u0632\u0644 \u0648\u0627\u0644\u0645\u0646\u0634\u0622\u062a."
    ),
    bullets: [
      makeLocalized(
        "Site assessment techniques for shading, structure, and electrical readiness.",
        "\u062a\u0642\u0646\u064a\u0627\u062a \u062a\u0642\u064a\u064a\u0645 \u0627\u0644\u0645\u0648\u0642\u0639 \u0645\u0646 \u0646\u0627\u062d\u064a\u0629 \u0627\u0644\u0638\u0644 \u0648\u0627\u0644\u0628\u0646\u064a\u0629 \u0648\u0627\u0644\u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629."
      ),
      makeLocalized(
        "Best practices for mounting hardware, wiring, and weatherproofing.",
        "\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0644\u062a\u062b\u0628\u064a\u062a \u0627\u0644\u0647\u064a\u0627\u0643\u0644\u060c \u062a\u0645\u062f\u064a\u062f \u0627\u0644\u0623\u0633\u0644\u0627\u0643\u060c \u0648\u0636\u0645\u0627\u0646 \u0627\u0644\u062d\u0645\u0627\u064a\u0629 \u0645\u0646 \u0627\u0644\u0639\u0648\u0627\u0645\u0644 \u0627\u0644\u062c\u0648\u064a\u0629."
      ),
      makeLocalized(
        "Commissioning checklists and safety inspections before grid connection.",
        "\u0642\u0648\u0627\u0626\u0645 \u0627\u0644\u062a\u062d\u0642\u0642 \u0648\u0627\u0644\u0641\u062d\u0648\u0635\u0627\u062a \u0627\u0644\u0623\u0645\u0646\u064a\u0629 \u0642\u0628\u0644 \u0631\u0628\u0637 \u0627\u0644\u0646\u0638\u0627\u0645 \u0628\u0627\u0644\u0634\u0628\u0643\u0629."
      ),
    ],
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80",
    resources: [
      {
        label: makeLocalized(
          "DIY rooftop installation guide (This Old House)",
          "\u062f\u0644\u064a\u0644 \u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u062a\u062f\u0631\u062c\u064a\u064b\u0627 (\u0628\u0631\u0646\u0627\u0645\u062c This Old House)"
        ),
        href: "https://www.youtube.com/watch?v=ZB83Y4mbG6c",
      },
      {
        label: makeLocalized(
          "Professional solar install walkthrough (Fully Charged Show)",
          "\u062c\u0648\u0644\u0629 \u0645\u0647\u0646\u064a\u0629 \u0641\u064a \u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0634\u0645\u0633\u064a\u0629 (\u0628\u0631\u0646\u0627\u0645\u062c Fully Charged)"
        ),
        href: "https://www.youtube.com/watch?v=NUU5aN4cR-w",
      },
    ],
  },
  {
    id: "sustainability",
    title: makeLocalized(
      "Eco Impact & Savings",
      "\u0627\u0644\u0623\u062b\u0631 \u0627\u0644\u0628\u064a\u0626\u064a \u0648\u0627\u0644\u062a\u0648\u0641\u064a\u0631"
    ),
    summary: makeLocalized(
      "Maximize carbon savings, integrate smart energy management, and extend system life.",
      "\u062d\u0642\u0651\u0642 \u0623\u0643\u0628\u0631 \u0642\u062f\u0631 \u0645\u0646 \u062e\u0641\u0636 \u0627\u0644\u0627\u0646\u0628\u0639\u0627\u062b\u0627\u062a \u0627\u0644\u0643\u0631\u0628\u0648\u0646\u064a\u0629\u060c \u0648\u0623\u062f\u0645\u062c \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0630\u0643\u064a\u0629\u060c \u0648\u0623\u0637\u0644 \u0639\u0645\u0631 \u0627\u0644\u0646\u0638\u0627\u0645."
    ),
    bullets: [
      makeLocalized(
        "Compare emissions reductions versus conventional electricity sources.",
        "\u0642\u0627\u0631\u0646 \u062e\u0641\u0636 \u0627\u0644\u0627\u0646\u0628\u0639\u0627\u062b\u0627\u062a \u0645\u0639 \u0645\u0635\u0627\u062f\u0631 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0627\u0644\u062a\u0642\u0644\u064a\u062f\u064a\u0629."
      ),
      makeLocalized(
        "Optimize consumption with smart meters, storage, and load shifting.",
        "\u062d\u0633\u0651\u0646 \u0627\u0633\u062a\u0647\u0644\u0627\u0643\u0643 \u0639\u0628\u0631 \u0627\u0644\u0639\u062f\u0627\u062f\u0627\u062a \u0627\u0644\u0630\u0643\u064a\u0629 \u0648\u0627\u0644\u062a\u062e\u0632\u064a\u0646 \u0648\u0625\u0632\u0627\u062d\u0629 \u0627\u0644\u0623\u062d\u0645\u0627\u0644."
      ),
      makeLocalized(
        "Plan preventative maintenance to sustain peak performance for decades.",
        "\u0636\u0639 \u062e\u0637\u0629 \u0635\u064a\u0627\u0646\u0629 \u0648\u0642\u0627\u0626\u064a\u0629 \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0627\u0644\u0623\u062f\u0627\u0621 \u0627\u0644\u0639\u0627\u0644\u064a \u0644\u0639\u0642\u0648\u062f \u0637\u0648\u064a\u0644\u0629."
      ),
    ],
    image:
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=1200&q=80",
  },
];

const installationPhases: InstallationPhase[] = [
  {
    title: makeLocalized("Assess & Design", "\u0627\u0644\u062a\u0642\u064a\u064a\u0645 \u0648\u0627\u0644\u062a\u0635\u0645\u064a\u0645"),
    description: makeLocalized(
      "Gather site data, roof dimensions, structural integrity, and load history. Use that information to simulate energy production.",
      "\u0627\u062c\u0645\u0639 \u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0645\u0648\u0642\u0639\u060c \u0623\u0628\u0639\u0627\u062f \u0627\u0644\u0633\u0642\u0641\u060c \u0633\u0644\u0627\u0645\u0629 \u0627\u0644\u0647\u064a\u0643\u0644\u060c \u0648\u0633\u062c\u0644 \u0627\u0644\u0623\u062d\u0645\u0627\u0644\u060c \u062b\u0645 \u0627\u0633\u062a\u062e\u062f\u0645\u0647\u0627 \u0644\u0645\u062d\u0627\u0643\u0627\u0629 \u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0637\u0627\u0642\u0629."
    ),
    icon: <PanelTop className="h-6 w-6 text-primary" />,
  },
  {
    title: makeLocalized("Install & Wire", "\u0627\u0644\u062a\u0631\u0643\u064a\u0628 \u0648\u0627\u0644\u062a\u0648\u0635\u064a\u0644"),
    description: makeLocalized(
      "Mount rails, secure panels, route cabling, and connect protection devices by following electrical codes.",
      "\u062b\u0628\u0651\u062a \u0627\u0644\u0642\u0636\u0628\u0627\u0646 \u0648\u0627\u0644\u0623\u0644\u0648\u0627\u062d\u060c \u0645\u0631\u0651\u0631 \u0627\u0644\u0623\u0633\u0644\u0627\u0643\u060c \u0648\u0648\u0635\u0644 \u0645\u0639\u062f\u0627\u062a \u0627\u0644\u062d\u0645\u0627\u064a\u0629 \u0648\u0641\u0642\u0627\u064b \u0644\u0644\u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0626\u064a\u0629."
    ),
    icon: <Sun className="h-6 w-6 text-primary" />,
  },
  {
    title: makeLocalized("Commission & Monitor", "\u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0648\u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629"),
    description: makeLocalized(
      "Test voltage, polarity, and insulation, then enable data monitoring to track performance and alerts.",
      "\u0627\u062e\u062a\u0628\u0631 \u0627\u0644\u062c\u0647\u062f\u060c \u0627\u0644\u0642\u0637\u0628\u064a\u0629\u060c \u0648\u0627\u0644\u0639\u0632\u0644\u060c \u062b\u0645 \u0641\u0639\u0651\u0644 \u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629 \u0644\u0645\u0631\u0627\u0642\u0628\u0629 \u0627\u0644\u0623\u062f\u0627\u0621 \u0648\u0627\u0644\u062a\u0646\u0628\u064a\u0647\u0627\u062a."
    ),
    icon: <Plug className="h-6 w-6 text-primary" />,
  },
  {
    title: makeLocalized("Maintain & Optimize", "\u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0648\u0627\u0644\u062a\u062d\u0633\u064a\u0646"),
    description: makeLocalized(
      "Schedule seasonal inspections, clean modules, and update firmware to keep yields high.",
      "\u0636\u0639 \u062c\u062f\u0648\u0644\u0627\u064b \u0644\u0644\u0641\u062d\u0648\u0635\u0627\u062a \u0627\u0644\u0645\u0648\u0633\u0645\u064a\u0629\u060c \u0646\u0638\u0651\u0641 \u0627\u0644\u0623\u0644\u0648\u0627\u062d\u060c \u0648\u062d\u062f\u0651\u062b \u0627\u0644\u0628\u0631\u0645\u062c\u064a\u0627\u062a \u0644\u0644\u062d\u0641\u0627\u0638 \u0639\u0644\u0649 \u0625\u0646\u062a\u0627\u062c\u064a\u0629 \u0645\u0631\u062a\u0641\u0639\u0629."
    ),
    icon: <Wrench className="h-6 w-6 text-primary" />,
  },
];

const sustainabilityHighlights: SustainabilityHighlight[] = [
  {
    title: makeLocalized("Cut Carbon Fast", "\u062e\u0641\u0636 \u0627\u0644\u0643\u0631\u0628\u0648\u0646 \u0628\u0633\u0631\u0639\u0629"),
    description: makeLocalized(
      "A 6 kW rooftop system avoids roughly 6 tons of CO2 each year compared to diesel generation.",
      "\u0645\u0646\u0638\u0648\u0645\u0629 \u0633\u0637\u062d \u0628\u0642\u062f\u0631\u0629 \u0666 \u0643\u064a\u0644\u0648\u0648\u0627\u0637 \u064a\u0645\u0643\u0646\u0647\u0627 \u062a\u062c\u0646\u0628 \u0646\u062d\u0648 \u0666 \u0623\u0637\u0646\u0627\u0646 \u0645\u0646 \u062b\u0627\u0646\u064a \u0623\u0643\u0633\u064a\u062f \u0627\u0644\u0643\u0631\u0628\u0648\u0646 \u0633\u0646\u0648\u064a\u0627\u064b \u0645\u0642\u0627\u0631\u0646\u0629 \u0628\u0645\u0648\u0644\u062f\u0627\u062a \u0627\u0644\u062f\u064a\u0632\u0644."
    ),
    icon: <Sun className="h-6 w-6 text-primary" />,
  },
  {
    title: makeLocalized("Energy Independence", "\u0627\u0633\u062a\u0642\u0644\u0627\u0644\u064a\u0629 \u0641\u064a \u0627\u0644\u0637\u0627\u0642\u0629"),
    description: makeLocalized(
      "Pairing storage with solar offers backup power during outages and helps stabilize local grids.",
      "\u062f\u0645\u062c \u0627\u0644\u062a\u062e\u0632\u064a\u0646 \u0645\u0639 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 \u064a\u0648\u0641\u0631 \u0637\u0627\u0642\u0629 \u0627\u062d\u062a\u064a\u0627\u0637\u064a\u0629 \u0623\u062b\u0646\u0627\u0621 \u0627\u0646\u0642\u0637\u0627\u0639 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0648\u064a\u0633\u0647\u0645 \u0641\u064a \u0627\u0633\u062a\u0642\u0631\u0627\u0631 \u0627\u0644\u0634\u0628\u0643\u0627\u062a \u0627\u0644\u0645\u062d\u0644\u064a\u0629."
    ),
    icon: <Leaf className="h-6 w-6 text-primary" />,
  },
  {
    title: makeLocalized("Smart Consumption", "\u0627\u0633\u062a\u0647\u0644\u0627\u0643 \u0630\u0643\u064a"),
    description: makeLocalized(
      "Load shifting and energy auditing can reduce household bills by 20-35% without lifestyle compromises.",
      "\u064a\u0633\u0627\u0639\u062f \u062a\u063a\u064a\u064a\u0631 \u0623\u0648\u0642\u0627\u062a \u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0623\u062c\u0647\u0632\u0629 \u0648\u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0627\u0633\u062a\u0647\u0644\u0627\u0643 \u0641\u064a \u062e\u0641\u0636 \u0641\u0648\u0627\u062a\u064a\u0631 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0628\u0646\u0633\u0628\u0629 \u0662\u0660\u2013\u0663\u0665\u066a \u062f\u0648\u0646 \u0627\u0644\u062a\u0623\u062b\u064a\u0631 \u0639\u0644\u0649 \u0646\u0645\u0637 \u0627\u0644\u062d\u064a\u0627\u0629."
    ),
    icon: <LifeBuoy className="h-6 w-6 text-primary" />,
  },
];

const mediaResources: MediaResource[] = [
  {
    title: makeLocalized(
      "Solar 101: Photovoltaic Basics (NREL)",
      "\u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 101: \u0623\u0633\u0627\u0633\u064a\u0627\u062a \u0627\u0644\u062e\u0644\u0627\u064a\u0627 \u0627\u0644\u0643\u0647\u0631\u0648\u0636\u0648\u0626\u064a\u0629 (\u0627\u0644\u0645\u062e\u062a\u0628\u0631 \u0627\u0644\u0648\u0637\u0646\u064a \u0644\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0645\u062a\u062c\u062f\u062f\u0629)"
    ),
    description: makeLocalized(
      "Interactive guide with diagrams explaining modules, inverters, and grid integration.",
      "\u062f\u0644\u064a\u0644 \u062a\u0641\u0627\u0639\u0644\u064a \u064a\u0648\u0636\u062d \u0628\u0627\u0644\u0645\u062e\u0637\u0637\u0627\u062a \u0645\u0643\u0648\u0646\u0627\u062a \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0648\u0627\u0644\u0639\u0648\u0627\u0643\u0633 \u0648\u0643\u064a\u0641\u064a\u0629 \u0627\u0644\u0631\u0628\u0637 \u0628\u0627\u0644\u0634\u0628\u0643\u0629."
    ),
    image:
      "https://images.unsplash.com/photo-1505731132164-cca9038f05df?auto=format&fit=crop&w=1000&q=80",
    href: "https://www.nrel.gov/research/re-photovoltaics.html",
    type: "guide",
    source: "NREL",
  },
  {
    title: makeLocalized(
      "How to Install Solar Panels (Solar Energy International)",
      "\u0643\u064a\u0641\u064a\u0629 \u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0634\u0645\u0633\u064a\u0629 (\u062c\u0645\u0639\u064a\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 \u0627\u0644\u062f\u0648\u0644\u064a\u0629)"
    ),
    description: makeLocalized(
      "Hands-on training clips covering mounting, wiring, and safety gear.",
      "\u0645\u0642\u0627\u0637\u0639 \u062a\u062f\u0631\u064a\u0628\u064a\u0629 \u0639\u0645\u0644\u064a\u0629 \u062a\u063a\u0637\u064a \u0627\u0644\u062a\u062b\u0628\u064a\u062a\u060c \u0627\u0644\u062a\u0648\u0635\u064a\u0644\u0627\u062a\u060c \u0648\u0645\u0639\u062f\u0627\u062a \u0627\u0644\u0633\u0644\u0627\u0645\u0629."
    ),
    image:
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1000&q=80",
    href: "https://www.youtube.com/watch?v=xKxrkht7CpY",
    type: "video",
    source: "Solar Energy International",
  },
  {
    title: makeLocalized(
      "IEA Net-Zero Scenario Insights",
      "\u0631\u0624\u0649 \u0648\u0643\u0627\u0644\u0629 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u062f\u0648\u0644\u064a\u0629 \u0644\u0633\u064a\u0646\u0627\u0631\u064a\u0648 \u0635\u0627\u0641\u064a \u0627\u0644\u0627\u0646\u0628\u0639\u0627\u062b\u0627\u062a \u0627\u0644\u0635\u0641\u0631\u064a"
    ),
    description: makeLocalized(
      "Global projections and policy pathways to accelerate solar adoption responsibly.",
      "\u062a\u0648\u0642\u0639\u0627\u062a \u0639\u0627\u0644\u0645\u064a\u0629 \u0648\u0645\u0633\u0627\u0631\u0627\u062a \u0633\u064a\u0627\u0633\u0627\u062a \u0644\u062a\u0633\u0631\u064a\u0639 \u062a\u0628\u0646\u064a \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 \u0628\u0634\u0643\u0644 \u0645\u0633\u0624\u0648\u0644."
    ),
    image:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
    href: "https://www.iea.org/reports/net-zero-by-2050",
    type: "case-study",
    source: "International Energy Agency",
  },
];

const faqItems: FaqItem[] = [
  {
    question: makeLocalized(
      "How long does a solar installation take?",
      "\u0643\u0645 \u064a\u0633\u062a\u063a\u0631\u0642 \u062a\u0631\u0643\u064a\u0628 \u0646\u0638\u0627\u0645 \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629\u061f"
    ),
    answer: makeLocalized(
      "Small residential projects can be completed in 2-3 days after permitting, while commercial systems may take several weeks including inspections.",
      "\u064a\u0645\u0643\u0646 \u0625\u0643\u0645\u0627\u0644 \u0645\u0634\u0627\u0631\u064a\u0639 \u0627\u0644\u0645\u0646\u0627\u0632\u0644 \u0627\u0644\u0635\u063a\u064a\u0631\u0629 \u062e\u0644\u0627\u0644 \u064a\u0648\u0645\u064a\u0646 \u0625\u0644\u0649 \u062b\u0644\u0627\u062b\u0629 \u0628\u0639\u062f \u0627\u0644\u062d\u0635\u0648\u0644 \u0639\u0644\u0649 \u0627\u0644\u062a\u0635\u0627\u0631\u064a\u062d\u060c \u0628\u064a\u0646\u0645\u0627 \u0642\u062f \u062a\u0633\u062a\u063a\u0631\u0642 \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u062a\u062c\u0627\u0631\u064a\u0629 \u0639\u062f\u0629 \u0623\u0633\u0627\u0628\u064a\u0639 \u062a\u0634\u0645\u0644 \u0627\u0644\u0641\u062d\u0648\u0635\u0627\u062a."
    ),
  },
  {
    question: makeLocalized(
      "Do panels work on cloudy days?",
      "\u0647\u0644 \u062a\u0639\u0645\u0644 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0641\u064a \u0627\u0644\u0623\u064a\u0627\u0645 \u0627\u0644\u063a\u0627\u0626\u0645\u0629\u061f"
    ),
    answer: makeLocalized(
      "Yes, modern panels produce 10-25% of their rated output under clouds. Battery storage can bridge lower production periods.",
      "\u0646\u0639\u0645\u060c \u062a\u0646\u062a\u062c \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u062d\u062f\u064a\u062b\u0629 \u0645\u0627 \u0628\u064a\u0646 \u0661\u0660\u066a \u0648\u0662\u0665\u066a \u0645\u0646 \u0642\u062f\u0631\u062a\u0647\u0627 \u0627\u0644\u0627\u0633\u0645\u064a\u0629 \u0641\u064a \u0627\u0644\u0637\u0642\u0633 \u0627\u0644\u063a\u0627\u0626\u0645\u060c \u0648\u064a\u0645\u0643\u0646 \u0644\u0644\u062a\u062e\u0632\u064a\u0646 \u0628\u0627\u0644\u0628\u0637\u0627\u0631\u064a\u0627\u062a \u062a\u0639\u0648\u064a\u0636 \u0627\u0644\u0641\u062a\u0631\u0627\u062a \u0630\u0627\u062a \u0627\u0644\u0625\u0646\u062a\u0627\u062c \u0627\u0644\u0623\u0642\u0644."
    ),
  },
  {
    question: makeLocalized(
      "What maintenance is required?",
      "\u0645\u0627 \u0627\u0644\u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629\u061f"
    ),
    answer: makeLocalized(
      "Keep modules clean, inspect wiring annually, and update monitoring firmware. Professional check-ups every 2-3 years are recommended.",
      "\u0627\u062d\u0641\u0638 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0646\u0638\u064a\u0641\u0629\u060c \u062a\u0641\u062d\u0651\u0635 \u0627\u0644\u0623\u0633\u0644\u0627\u0643 \u0633\u0646\u0648\u064a\u0627\u064b\u060c \u0648\u062d\u062f\u0651\u062b \u0628\u0631\u0645\u062c\u064a\u0627\u062a \u0627\u0644\u0645\u062a\u0627\u0628\u0639\u0629. \u064a\u064f\u0646\u0635\u062d \u0628\u0641\u062d\u0648\u0635\u0627\u062a \u0627\u062d\u062a\u0631\u0627\u0641\u064a\u0629 \u0643\u0644 \u0633\u0646\u062a\u064a\u0646 \u0623\u0648 \u062b\u0644\u0627\u062b."
    ),
  },
];

const heroMetrics = [
  {
    label: makeLocalized(
      "Average Payback",
      "\u0645\u062a\u0648\u0633\u0637 \u0641\u062a\u0631\u0629 \u0627\u0644\u0627\u0633\u062a\u0631\u062f\u0627\u062f"
    ),
    value: makeLocalized("4\u20136 years", "\u0664\u2013\u0666 \u0633\u0646\u0648\u0627\u064b"),
  },
  {
    label: makeLocalized("Carbon Savings", "\u062e\u0641\u0636 \u0627\u0644\u0627\u0646\u0628\u0639\u0627\u062b\u0627\u062a"),
    value: makeLocalized(
      "6 tCO\u2082 per year",
      "\u0666 \u0623\u0637\u0646\u0627\u0646 \u0645\u0646 \u062b\u0627\u0646\u064a \u0623\u0643\u0633\u064a\u062f \u0627\u0644\u0643\u0631\u0628\u0648\u0646 \u0633\u0646\u0648\u064a\u0627\u064b"
    ),
  },
  {
    label: makeLocalized("System Lifespan", "\u0639\u0645\u0631 \u0627\u0644\u0646\u0638\u0627\u0645"),
    value: makeLocalized("25+ years", "\u0623\u0643\u062b\u0631 \u0645\u0646 \u0662\u0665 \u0639\u0627\u0645\u0627\u064b"),
  },
  {
    label: makeLocalized("Forum Guides", "\u0623\u062f\u0644\u0629 \u0627\u0644\u0645\u0646\u062a\u062f\u0649"),
    value: makeLocalized("40+ threads", "\u0623\u0643\u062b\u0631 \u0645\u0646 \u0664\u0660 \u0645\u0648\u0636\u0648\u0639\u0627\u064b"),
  },
];

const heroCopy = {
  badge: makeLocalized("Learning Hub", "\u0645\u0631\u0643\u0632 \u0627\u0644\u062a\u0639\u0644\u0645"),
  title: makeLocalized(
    "Solar Learning Hub for Smarter Energy Decisions",
    "\u0628\u0648\u0627\u0628\u0629 \u0627\u0644\u062a\u0639\u0644\u0645 \u0644\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 \u0644\u0635\u0646\u0639 \u0642\u0631\u0627\u0631\u0627\u062a \u0637\u0627\u0642\u064a\u0629 \u0623\u0630\u0643\u0649"
  ),
  description: makeLocalized(
    "Explore how photovoltaic systems power homes, businesses, and communities — from core technology to hands-on installation and eco-friendly operation.",
    "\u0627\u0633\u062a\u0643\u0634\u0641 \u0643\u064a\u0641 \u062a\u064f\u063a\u0630\u0651\u064a \u0627\u0644\u0623\u0646\u0638\u0645\u0629 \u0627\u0644\u0643\u0647\u0631\u0648\u0636\u0648\u0626\u064a\u0629 \u0627\u0644\u0645\u0646\u0627\u0632\u0644\u060c \u0627\u0644\u0634\u0631\u0643\u0627\u062a، \u0648\u0627\u0644\u0645\u062c\u062a\u0645\u0639\u0627\u062a \u0628\u0623\u0643\u0645\u0644\u0647\u0627\u060c \u0645\u0646 \u0627\u0644\u062a\u0642\u0646\u064a\u0629 \u0627\u0644\u0623\u0633\u0627\u0633\u064a\u0629 \u0625\u0644\u0649 \u0627\u0644\u062a\u0631\u0643\u064a\u0628 \u0627\u0644\u0639\u0645\u0644\u064a \u0648\u0627\u0644\u062a\u0634\u063a\u064a\u0644 \u0627\u0644\u0635\u062f\u064a\u0642 \u0644\u0644\u0628\u064a\u0626\u0629."
  ),
  ctaExplore: makeLocalized("Explore Learning Paths", "\u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u0633\u0627\u0631\u0627\u062a \u0627\u0644\u062a\u0639\u0644\u0645"),
  ctaCommunity: makeLocalized("Ask the Community", "\u0627\u0633\u0623\u0644 \u0627\u0644\u0645\u062c\u062a\u0645\u0639"),
  imageAlt: makeLocalized(
    "Technician installing solar panels",
    "\u0641\u0646\u064a \u064a\u0631\u0643\u0628 \u0627\u0644\u0623\u0644\u0648\u0627\u062d \u0627\u0644\u0634\u0645\u0633\u064a\u0629"
  ),
};

const learningIntro = {
  heading: makeLocalized(
    "Choose the learning track that fits your goal",
    "\u0627\u062e\u062a\u0631 \u0645\u0633\u0627\u0631 \u0627\u0644\u062a\u0639\u0644\u0645 \u0627\u0644\u0630\u064a \u064a\u0646\u0627\u0633\u0628 \u0647\u062f\u0641\u0643"
  ),
  description: makeLocalized(
    "Whether you are getting started or preparing to install your own system, these tracks mix articles, visuals, and expert tips to keep you moving forward.",
    "\u0633\u0648\u0627\u0621 \u0643\u0646\u062a \u062a\u0628\u062f\u0623 \u0645\u0646 \u0627\u0644\u0635\u0641\u0631 \u0623\u0648 \u062a\u0633\u062a\u0639\u062f \u0644\u062a\u0631\u0643\u064a\u0628 \u0646\u0638\u0627\u0645\u0643 \u0627\u0644\u062e\u0627\u0635\u060c \u062a\u062c\u0645\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u0633\u0627\u0631\u0627\u062a \u0628\u064a\u0646 \u0627\u0644\u0645\u0642\u0627\u0644\u0627\u062a \u0648\u0627\u0644\u0645\u0631\u0626\u064a\u0627\u062a \u0648\u0646\u0635\u0627\u0626\u062d \u0627\u0644\u062e\u0628\u0631\u0627\u0621 \u0644\u062a\u0633\u0627\u0639\u062f\u0643 \u0639\u0644\u0649 \u0627\u0644\u062a\u0642\u062f\u0645."
  ),
  discussCta: makeLocalized("Discuss in Forum", "\u0646\u0627\u0642\u0634 \u0641\u064a \u0627\u0644\u0645\u0646\u062a\u062f\u0649"),
  mediaCta: makeLocalized("View supporting media", "\u0627\u0637\u0644\u0639 \u0639\u0644\u0649 \u0627\u0644\u0645\u0648\u0627\u062f \u0627\u0644\u062f\u0627\u0639\u0645\u0629"),
};

const installationIntro = {
  heading: makeLocalized("Installation roadmap", "\u062e\u0627\u0631\u0637\u0629 \u0637\u0631\u064a\u0642 \u0627\u0644\u062a\u0631\u0643\u064a\u0628"),
  description: makeLocalized(
    "Follow this four-phase roadmap to plan, install, and maintain a resilient solar array for your roof or business site.",
    "\u0627\u062a\u0628\u0639 \u0647\u0630\u0647 \u0627\u0644\u0645\u0631\u0627\u062d\u0644 \u0627\u0644\u0623\u0631\u0628\u0639 \u0644\u062a\u062e\u0637\u064a\u0637 \u0648\u062a\u0631\u0643\u064a\u0628 \u0648\u0635\u064a\u0627\u0646\u0629 \u0645\u0646\u0638\u0648\u0645\u0629 \u0634\u0645\u0633\u064a\u0629 \u0645\u062a\u064a\u0646\u0629 \u0639\u0644\u0649 \u0633\u0637\u062d \u0645\u0646\u0632\u0644\u0643 \u0623\u0648 \u0645\u0646\u0634\u0623\u062a\u0643."
  ),
  phaseLabel: makeLocalized("Phase", "\u0627\u0644\u0645\u0631\u062d\u0644\u0629"),
};

const sustainabilityIntro = {
  heading: makeLocalized(
    "Sustainability and eco-living highlights",
    "\u0623\u0628\u0631\u0632 \u0627\u0644\u0641\u0648\u0627\u0626\u062f \u0627\u0644\u0628\u064a\u0626\u064a\u0629 \u0648\u0646\u0645\u0637 \u0627\u0644\u062d\u064a\u0627\u0629 \u0627\u0644\u0645\u0633\u062a\u062f\u0627\u0645"
  ),
  description: makeLocalized(
    "Solar empowers communities to shrink carbon footprints while improving energy resilience. Pair your system with smart habits to multiply impact.",
    "\u062a\u0645\u0646\u062d \u0627\u0644\u0637\u0627\u0642\u0629 \u0627\u0644\u0634\u0645\u0633\u064a\u0629 \u0627\u0644\u0645\u062c\u062a\u0645\u0639\u0627\u062a \u0627\u0644\u0642\u062f\u0631\u0629 \u0639\u0644\u0649 \u062a\u0642\u0644\u064a\u0644 \u0627\u0644\u0628\u0635\u0645\u0629 \u0627\u0644\u0643\u0631\u0628\u0648\u0646\u064a\u0629 \u0648\u062a\u062d\u0633\u064a\u0646 \u0645\u0631\u0648\u0646\u0629 \u0627\u0644\u0637\u0627\u0642\u0629. \u0627\u0631\u0628\u0637 \u0646\u0638\u0627\u0645\u0643 \u0628\u0639\u0627\u062f\u0627\u062a \u0630\u0643\u064a\u0629 \u0644\u062a\u0639\u0638\u064a\u0645 \u0627\u0644\u0623\u062b\u0631."
  ),
};

const mediaIntro = {
  heading: makeLocalized(
    "Media library and expert references",
    "\u0645\u0643\u062a\u0628\u0629 \u0627\u0644\u0648\u0633\u0627\u0626\u0637 \u0648\u0627\u0644\u0645\u0631\u0627\u062c\u0639 \u0627\u0644\u0645\u062a\u062e\u0635\u0635\u0629"
  ),
  description: makeLocalized(
    "Dive deeper with curated videos, guides, and international case studies. Each resource opens in a new tab for easy viewing.",
    "\u062a\u0639\u0645\u0651\u0642 \u0623\u0643\u062b\u0631 \u0639\u0628\u0631 \u0645\u0648\u0627\u062f \u0645\u062e\u062a\u0627\u0631\u0629 \u0645\u0646 \u0627\u0644\u0641\u064a\u062f\u064a\u0648\u0647\u0627\u062a\u060c \u0627\u0644\u0625\u0631\u0634\u0627\u062f\u0627\u062a\u060c \u0648\u062f\u0631\u0627\u0633\u0627\u062a \u0627\u0644\u062d\u0627\u0644\u0629 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629. \u062a\u064f\u0641\u064a\u062d \u0643\u0644 \u0645\u0627\u062f\u0629 \u0641\u064a \u0646\u0627\u0641\u0630\u0629 \u062c\u062f\u064a\u062f\u0629 \u0644\u0633\u0647\u0648\u0644\u0629 \u0627\u0644\u062a\u0635\u0641\u062d."
  ),
  openResource: makeLocalized("Open resource", "\u0641\u062a\u062d \u0627\u0644\u0645\u0631\u062c\u0639"),
  referenceNote: makeLocalized(
    "Reference links are maintained by trusted institutions such as NREL, SEI, and the IEA. Always verify local standards before installation.",
    "\u062a\u062a\u0645 \u0635\u064a\u0627\u0646\u0629 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0631\u062c\u0639\u064a\u0629 \u0645\u0646 \u0645\u0624\u0633\u0633\u0627\u062a \u0645\u0648\u062b\u0648\u0642\u0629 \u0645\u062b\u0644 NREL \u0648SEI \u0648IEA. \u062a\u062d\u0642\u0651\u0642 \u062f\u0627\u0626\u0645\u0627\u064b \u0645\u0646 \u0627\u0644\u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u0645\u062d\u0644\u064a\u0629 \u0642\u0628\u0644 \u0627\u0644\u062a\u0631\u0643\u064a\u0628."
  ),
};

const mediaTypeLabels = {
  video: makeLocalized("Video", "\u0641\u064a\u062f\u064a\u0648"),
  guide: makeLocalized("Guide", "\u062f\u0644\u064a\u0644"),
  caseStudy: makeLocalized("Case Study", "\u062f\u0631\u0627\u0633\u0629 \u062d\u0627\u0644\u0629"),
};

const communityCopy = {
  heading: makeLocalized("Join the discussion", "\u0634\u0627\u0631\u0643 \u0627\u0644\u0646\u0642\u0627\u0634"),
  description: makeLocalized(
    "Learners and installers share tips daily in the Solar Glow forum. Post questions, compare system designs, and celebrate your milestones.",
    "\u064a\u062a\u0628\u0627\u062f\u0644 \u0627\u0644\u0645\u062a\u0639\u0644\u0645\u0648\u0646 \u0648\u0627\u0644\u0645\u0631\u0643\u0628\u0648\u0646 \u0627\u0644\u0646\u0635\u0627\u0626\u062d \u064a\u0648\u0645\u064a\u0627\u064b \u0641\u064a \u0645\u0646\u062a\u062f\u0649 \u0633\u0648\u0644\u0627\u0631 \u062c\u0644\u0648. \u0627\u0637\u0631\u062d \u0623\u0633\u0626\u0644\u062a\u0643\u060c \u0648\u0642\u0627\u0631\u0646 \u062a\u0635\u0645\u064a\u0645\u0627\u062a \u0627\u0644\u0623\u0646\u0638\u0645\u0629\u060c \u0648\u0627\u062d\u062a\u0641\u0644 \u0628\u0625\u0646\u062c\u0627\u0632\u0627\u062a\u0643."
  ),
  visitTopic: makeLocalized("Visit topic", "\u0632\u064a\u0627\u0631\u0629 \u0627\u0644\u0645\u0648\u0636\u0648\u0639"),
  goForum: makeLocalized("Go to Solar Glow Forum", "\u0627\u0630\u0647\u0628 \u0625\u0644\u0649 \u0645\u0646\u062a\u062f\u0649 \u0633\u0648\u0644\u0627\u0631 \u062c\u0644\u0648"),
};

const guidanceCopy = {
  heading: makeLocalized("Need personalized guidance?", "\u0647\u0644 \u062a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0625\u0631\u0634\u0627\u062f \u0645\u062e\u0635\u0635\u061f"),
  description: makeLocalized(
    "Send us your project idea and our solar specialists will share localized checklists and financing options.",
    "\u0623\u0631\u0633\u0644 \u0644\u0646\u0627 \u0641\u0643\u0631\u0629 \u0645\u0634\u0631\u0648\u0639\u0643 \u0648\u0633\u064a\u0634\u0627\u0631\u0643\u0643 \u062e\u0628\u0631\u0627\u0624\u0646\u0627 \u0642\u0648\u0627\u0626\u0645 \u0641\u062d\u0635 \u0648\u062e\u064a\u0627\u0631\u0627\u062a \u062a\u0645\u0648\u064a\u0644 \u0645\u0648\u062c\u0647\u0629 \u0644\u0645\u0646\u0637\u0642\u062a\u0643."
  ),
  fields: {
    nameLabel: makeLocalized("Full name", "\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644"),
    namePlaceholder: makeLocalized("Enter your name", "\u0623\u062f\u062e\u0644 \u0627\u0633\u0645\u0643"),
    emailLabel: makeLocalized("Email address", "\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a"),
    locationLabel: makeLocalized("City or location", "\u0627\u0644\u0645\u062f\u064a\u0646\u0629 / \u0627\u0644\u0645\u0648\u0642\u0639"),
    locationPlaceholder: makeLocalized("Where are you based?", "\u0623\u064a\u0646 \u062a\u0642\u064a\u0645\u061f"),
    messageLabel: makeLocalized("Tell us about your solar goals", "\u062d\u062f\u062b\u0646\u0627 \u0639\u0646 \u0623\u0647\u062f\u0627\u0641\u0643 \u0627\u0644\u0634\u0645\u0633\u064a\u0629"),
    messagePlaceholder: makeLocalized(
      "Roof area, monthly bill, or installation questions…",
      "\u0645\u0633\u0627\u062d\u0629 \u0627\u0644\u0633\u0637\u062d\u060c \u0627\u0644\u0641\u0627\u062a\u0648\u0631\u0629 \u0627\u0644\u0634\u0647\u0631\u064a\u0629\u060c \u0623\u0648 \u0623\u0633\u0626\u0644\u0629 \u062d\u0648\u0644 \u0627\u0644\u062a\u0631\u0643\u064a\u0628..."
    ),
  },
  submit: makeLocalized("Submit request", "\u0625\u0631\u0633\u0627\u0644 \u0627\u0644\u0637\u0644\u0628"),
};

const faqIntro = {
  heading: makeLocalized("Frequently asked questions", "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0645\u062a\u0643\u0631\u0631\u0629"),
  description: makeLocalized(
    "Answers curated by Solar Glow mentors, blending international standards with local best practices.",
    "\u0625\u062c\u0627\u0628\u0627\u062a \u064a\u0642\u062f\u0645\u0647\u0627 \u0645\u0631\u0634\u062f\u0648 \u0633\u0648\u0644\u0627\u0631 \u062c\u0644\u0648\u060c \u062a\u0632\u062c\u0645 \u0628\u064a\u0646 \u0627\u0644\u0645\u0639\u0627\u064a\u064a\u0631 \u0627\u0644\u0639\u0627\u0644\u0645\u064a\u0629 \u0648\u0623\u0641\u0636\u0644 \u0627\u0644\u0645\u0645\u0627\u0631\u0633\u0627\u062a \u0627\u0644\u0645\u062d\u0644\u064a\u0629."
  ),
};

const toastCopy = {
  title: makeLocalized("Thanks for reaching out!", "\u0634\u0643\u0631\u0627\u064b \u0644\u062a\u0648\u0627\u0635\u0644\u0643 \u0645\u0639\u0646\u0627!"),
  description: makeLocalized(
    "Our team will contact you with tailored solar resources.",
    "\u0633\u064a\u062a\u0648\u0627\u0635\u0644 \u0641\u0631\u064a\u0642\u0646\u0627 \u0645\u0639\u0643 \u0644\u062a\u0632\u0648\u064a\u062f\u0643 \u0628\u0645\u0648\u0627\u062f \u062a\u0639\u0644\u064a\u0645\u064a\u0629 \u0645\u062e\u0635\u0635\u0629."
  ),
};

const SolarEducation = () => {
  const { lang, t } = useLanguage();
  const { toast } = useToast();

  const translate = (value: LocalizedString) => (lang === "ar" ? value.ar : value.en);

  const formSchema = useMemo(
    () =>
      z.object({
        name: z.string().min(2, {
          message:
            lang === "ar"
              ? "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0627\u0644\u0627\u0633\u0645."
              : "Please provide a name.",
        }),
        email: z.string().email({
          message:
            lang === "ar"
              ? "\u064a\u0631\u062c\u0649 \u0625\u062f\u062e\u0627\u0644 \u0628\u0631\u064a\u062f \u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0635\u0627\u0644\u062d."
              : "Please provide a valid email.",
        }),
        location: z.string().min(2, {
          message:
            lang === "ar"
              ? "\u064a\u0631\u062c\u0649 \u062a\u062d\u062f\u064a\u062f \u0645\u0648\u0642\u0639\u0643."
              : "Let us know where you are located.",
        }),
        message: z.string().max(600).optional(),
      }),
    [lang]
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      location: "",
      message: "",
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.info("Solar education inquiry", values);
    toast({
      title: translate(toastCopy.title),
      description: translate(toastCopy.description),
    });
    form.reset();
  };

  return (
    <div className="container mx-auto px-4 py-12 space-y-16" dir={lang === "ar" ? "rtl" : "ltr"}>
      <ScrollReveal initiallyVisible>
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950 via-blue-800 to-solar-blue px-6 py-16 text-white shadow-lg">
          <div className="grid items-center gap-10 md:grid-cols-[1.2fr,1fr]">
            <div className="space-y-6">
              <Badge className="bg-white/10 text-white backdrop-blur-sm">
                {translate(heroCopy.badge)}
              </Badge>
              <h1 className="text-4xl font-bold leading-tight md:text-5xl">
                {translate(heroCopy.title)}
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed max-w-2xl">
                {translate(heroCopy.description)}
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-100" asChild>
                  <a href="#learning-paths">
                    {translate(heroCopy.ctaExplore)}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 text-white" asChild>
                  <Link to="/forum">
                    {translate(heroCopy.ctaCommunity)}
                    <MessageCircle className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-6 pt-6 md:grid-cols-4">
                {heroMetrics.map((metric, index) => (
                  <div key={index} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-blue-100">{translate(metric.label)}</p>
                    <p className="text-2xl font-semibold">{translate(metric.value)}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative hidden overflow-hidden rounded-2xl border border-white/10 shadow-xl md:block">
              <AspectRatio ratio={4 / 3}>
                <img
                  src="/images/solar-hero.png"
                  alt={translate(heroCopy.imageAlt)}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    const target = event.target as HTMLImageElement;
                    target.src = "/placeholder.svg";
                  }}
                />
              </AspectRatio>
              <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 to-transparent" />
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="learning-paths" className="space-y-8">
          <div className={`space-y-4 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-bold">{translate(learningIntro.heading)}</h2>
            <p className="text-muted-foreground max-w-3xl">{translate(learningIntro.description)}</p>
          </div>

          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="flex flex-wrap gap-2 bg-muted/40 p-2">
              {learningTracks.map((track) => (
                <TabsTrigger key={track.id} value={track.id} className="flex-1 min-w-[160px]">
                  {translate(track.title)}
                </TabsTrigger>
              ))}
            </TabsList>

            {learningTracks.map((track) => (
              <TabsContent key={track.id} value={track.id}>
                <Card className="overflow-hidden">
                  <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
                    <div className="space-y-4 p-6">
                      <CardTitle className="text-2xl">{translate(track.title)}</CardTitle>
                      <CardDescription className="text-base">
                        {translate(track.summary)}
                      </CardDescription>
                      <ul className="space-y-3">
                        {track.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-sm">
                            <ChevronRight className="mt-1 h-4 w-4 text-primary" />
                            <span>{translate(bullet)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-3">
                        <Button asChild>
                          <Link to={`/forum/category/${track.id}`}>
                            {translate(learningIntro.discussCta)}
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <a href="#media-library">
                            {translate(learningIntro.mediaCta)}
                          </a>
                        </Button>
                      </div>
                    </div>
                    <div className="bg-muted">
                      <AspectRatio ratio={4 / 3}>
                        <img
                          src={track.image}
                          alt={translate(track.title)}
                          className="h-full w-full object-cover"
                        />
                      </AspectRatio>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </ScrollReveal>

      <ScrollReveal direction="up">
        <section className="space-y-8">
          <div className={`space-y-3 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-bold">{translate(installationIntro.heading)}</h2>
            <p className="text-muted-foreground max-w-3xl">{translate(installationIntro.description)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {installationPhases.map((phase, index) => (
              <Card key={index} className="h-full">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">{phase.icon}</div>
                  <div>
                    <CardTitle>{translate(phase.title)}</CardTitle>
                    <CardDescription>
                      {translate(installationIntro.phaseLabel)} {index + 1}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed">
                  {translate(phase.description)}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="rounded-3xl border bg-muted/30 p-8 backdrop-blur">
          <div className={`space-y-6 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-bold">{translate(sustainabilityIntro.heading)}</h2>
            <p className="text-muted-foreground max-w-3xl">{translate(sustainabilityIntro.description)}</p>
            <div className="grid gap-6 md:grid-cols-3">
              {sustainabilityHighlights.map((highlight, index) => (
                <Card key={index} className="border-none bg-white shadow-sm">
                  <CardHeader className="space-y-3">
                    <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-3">
                      {highlight.icon}
                    </div>
                    <CardTitle className="text-xl">{translate(highlight.title)}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm leading-relaxed text-muted-foreground">
                    {translate(highlight.description)}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section id="media-library" className="space-y-8">
          <div className={`space-y-3 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-bold">{translate(mediaIntro.heading)}</h2>
            <p className="text-muted-foreground max-w-3xl">{translate(mediaIntro.description)}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {mediaResources.map((resource, index) => (
              <Card key={index} className="flex h-full flex-col overflow-hidden">
                <div className="bg-muted">
                  <AspectRatio ratio={4 / 3}>
                    <img
                      src={resource.image}
                      alt={translate(resource.title)}
                      className="h-full w-full object-cover"
                    />
                  </AspectRatio>
                </div>
                <CardHeader>
                 <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="uppercase tracking-wide">
                      {translate(
                        resource.type === "video"
                          ? mediaTypeLabels.video
                          : resource.type === "guide"
                          ? mediaTypeLabels.guide
                          : mediaTypeLabels.caseStudy
                      )}
                    </span>
                    <span>{resource.source}</span>
                  </div>
                  <CardTitle className="text-lg leading-tight">
                    {translate(resource.title)}
                  </CardTitle>
                  <CardDescription>{translate(resource.description)}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button variant="outline" className="w-full" asChild>
                    <a href={resource.href} target="_blank" rel="noopener noreferrer">
                      {translate(mediaIntro.openResource)}
                      <ExternalLink className={`ml-2 h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="rounded-2xl bg-primary/5 p-6 text-sm text-muted-foreground">
            <p>{translate(mediaIntro.referenceNote)}</p>
          </div>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
          <Card className="bg-gradient-to-br from-blue-50 to-white border border-blue-100">
            <CardHeader>
              <CardTitle className="text-2xl">{translate(communityCopy.heading)}</CardTitle>
              <CardDescription className="text-base leading-relaxed">
                {translate(communityCopy.description)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {[learningTracks[0], learningTracks[1]].map((track) => (
                  <div key={track.id} className="rounded-xl border border-blue-100 bg-white p-4">
                    <p className="text-sm font-semibold">{translate(track.title)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {translate(track.summary)}
                    </p>
                    <Button variant="link" className="px-0" asChild>
                      <Link to={`/forum/category/${track.id}`}>
                        {translate(communityCopy.visitTopic)}
                        <ArrowRight className={`ml-1 h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                      </Link>
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="lg" asChild>
                <Link to="/forum">
                  {translate(communityCopy.goForum)}
                  <MessageCircle className={`ml-2 h-4 w-4 ${lang === "ar" ? "rotate-180" : ""}`} />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{translate(guidanceCopy.heading)}</CardTitle>
              <CardDescription>{translate(guidanceCopy.description)}</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(guidanceCopy.fields.nameLabel)}</FormLabel>
                        <FormControl>
                          <Input placeholder={translate(guidanceCopy.fields.namePlaceholder)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(guidanceCopy.fields.emailLabel)}</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(guidanceCopy.fields.locationLabel)}</FormLabel>
                        <FormControl>
                          <Input placeholder={translate(guidanceCopy.fields.locationPlaceholder)} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{translate(guidanceCopy.fields.messageLabel)}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={translate(guidanceCopy.fields.messagePlaceholder)}
                            className="min-h-[120px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button type="submit" className="w-full">
                    {translate(guidanceCopy.submit)}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </section>
      </ScrollReveal>

      <ScrollReveal>
        <section className="space-y-6">
          <div className={`space-y-3 ${lang === "ar" ? "text-right" : "text-left"}`}>
            <h2 className="text-3xl font-bold">{translate(faqIntro.heading)}</h2>
            <p className="text-muted-foreground max-w-3xl">{translate(faqIntro.description)}</p>
          </div>

          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border rounded-xl px-4">
                <AccordionTrigger className="text-base font-semibold">
                  {translate(item.question)}
                </AccordionTrigger>
                <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                  {translate(item.answer)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default SolarEducation;

