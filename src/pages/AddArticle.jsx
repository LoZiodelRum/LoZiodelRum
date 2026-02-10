import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { ChevronLeft, Send, Loader2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const categories = [
  { value: "cultura", label: "Cultura" },
  { value: "rum", label: "Rum" },
  { value: "cocktail", label: "Cocktail" },
  { value: "intervista", label: "Intervista" },
  { value: "guida", label: "Guida" },
  { value: "evento", label: "Evento" },
];

export default function AddArticle() {
  const navigate = useNavigate();
  const { addArticle } = useAppData();
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "cultura",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const createArticleMutation = useMutation({
    mutationFn: (data) => addArticle(data),
    onSuccess: (data) => {
      setIsSubmitting(false);
      navigate(createPageUrl(`ArticleDetail?id=${data.id}`));
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    const next = {};
    if (!formData.title?.trim()) next.title = "Inserisci il titolo dell'articolo.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setIsSubmitting(true);
    createArticleMutation.mutate(formData);
  };

  const isValid = formData.title?.trim();

  return (
    <div className="min-h-screen px-4 md:px-6 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={createPageUrl("Magazine")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Nuovo articolo</h1>
            <p className="text-stone-500">Scrivi un articolo per il Magazine</p>
          </div>
        </div>

        <div className="space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              Correggi i campi indicati sotto prima di inviare.
            </div>
          )}
          <div>
            <Label className="mb-2 block">Titolo *</Label>
            <Input
              placeholder="Titolo dell'articolo"
              value={formData.title}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, title: e.target.value }));
                if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
              }}
              className={`bg-stone-800/50 border-stone-700 ${errors.title ? "border-red-500/50" : ""}`}
            />
            {errors.title && (
              <p className="mt-1.5 text-sm text-red-400">{errors.title}</p>
            )}
          </div>

          <div>
            <Label className="mb-2 block">Anteprima (excerpt)</Label>
            <Textarea
              placeholder="Breve descrizione per le anteprime"
              value={formData.excerpt}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, excerpt: e.target.value }))
              }
              rows={3}
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div>
            <Label className="mb-2 block">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(v) =>
                setFormData((prev) => ({ ...prev, category: v }))
              }
            >
              <SelectTrigger className="bg-stone-800/50 border-stone-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-stone-900 border-stone-800">
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Immagine di copertina (URL)</Label>
            <Input
              placeholder="https://..."
              value={formData.cover_image}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, cover_image: e.target.value }))
              }
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div>
            <Label className="mb-2 block">Contenuto (testo o Markdown)</Label>
            <Textarea
              placeholder="Scrivi il contenuto dell'articolo..."
              value={formData.content}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, content: e.target.value }))
              }
              rows={14}
              className="bg-stone-800/50 border-stone-700 font-mono text-sm"
            />
          </div>

          {/* Anteprima */}
          <div className="rounded-2xl border border-stone-700/50 bg-stone-900/50 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-800 text-stone-400 text-sm">
              <Eye className="w-4 h-4" />
              <span className="font-medium">Anteprima</span>
            </div>
            <div className="p-4 space-y-3">
              {formData.cover_image && (
                <img
                  src={formData.cover_image}
                  alt="Copertina"
                  className="w-full h-40 object-cover rounded-lg bg-stone-800"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              {formData.title && (
                <h3 className="text-lg font-bold text-white">
                  {formData.title}
                </h3>
              )}
              {formData.category && (
                <span className="inline-block px-2.5 py-0.5 rounded-lg text-xs font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {categories.find((c) => c.value === formData.category)?.label || formData.category}
                </span>
              )}
              {formData.excerpt && (
                <p className="text-sm text-stone-400 line-clamp-2">
                  {formData.excerpt}
                </p>
              )}
              {formData.content && (
                <div className="text-sm text-stone-500 line-clamp-4 whitespace-pre-wrap">
                  {formData.content.slice(0, 400)}
                  {formData.content.length > 400 ? "…" : ""}
                </div>
              )}
              {!formData.title && !formData.excerpt && !formData.content && !formData.cover_image && (
                <p className="text-stone-600 text-sm">L’anteprima apparirà qui mentre scrivi.</p>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Send className="w-5 h-5 mr-2" />
            )}
            Pubblica articolo
          </Button>
        </div>
      </div>
    </div>
  );
}
