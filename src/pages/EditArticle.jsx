import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useAppData } from "@/lib/AppDataContext";
import { ChevronLeft, Save, Loader2, Trash2 } from "lucide-react";
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

export default function EditArticle() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get("id");
  const navigate = useNavigate();
  const { getArticleById, updateArticle, deleteArticle } = useAppData();
  const article = getArticleById(articleId);

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    cover_image: "",
    category: "cultura",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (article && articleId) {
      setFormData({
        title: article.title || "",
        excerpt: article.excerpt || "",
        content: article.content || "",
        cover_image: article.cover_image || "",
        category: article.category || "cultura",
      });
    }
  }, [articleId]);

  const updateArticleMutation = useMutation({
    mutationFn: (data) => updateArticle(articleId, data),
    onSuccess: () => {
      setIsSubmitting(false);
      navigate(createPageUrl(`ArticleDetail?id=${articleId}`));
    },
    onError: () => {
      setIsSubmitting(false);
    },
  });

  const handleSubmit = () => {
    if (!formData.title?.trim()) return;
    setIsSubmitting(true);
    updateArticleMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (!articleId || !article) return;
    deleteArticle(articleId);
    navigate(createPageUrl("Magazine"));
    setShowDeleteConfirm(false);
  };

  if (articleId && !article) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-stone-500 mb-4">Articolo non trovato.</p>
          <Link to={createPageUrl("Magazine")}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-stone-950">
              Torna al Magazine
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 md:px-6 pt-8 pb-28 lg:pb-12">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8 pt-6">
          <Link
            to={createPageUrl("Magazine")}
            className="p-2 hover:bg-stone-800 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">Modifica articolo</h1>
            <p className="text-stone-500">{article?.title}</p>
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title?.trim() || isSubmitting}
            className="bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold px-4"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Salva"}
          </Button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            title="Elimina articolo"
            className="p-2 flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/30 rounded-xl hover:bg-red-500/20 transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-900 rounded-2xl p-6 max-w-sm w-full border border-stone-800">
              <p className="mb-6 text-stone-200">Sei sicuro di voler eliminare questo articolo?</p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border-stone-600 text-stone-400 hover:bg-stone-800"
                >
                  Annulla
                </Button>
                <Button
                  onClick={handleDelete}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Elimina
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-6">
          <div>
            <Label className="mb-2 block">Titolo *</Label>
            <Input
              placeholder="Titolo dell'articolo"
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="bg-stone-800/50 border-stone-700"
            />
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

          <Button
            onClick={handleSubmit}
            disabled={!formData.title?.trim() || isSubmitting}
            className="w-full bg-amber-500 hover:bg-amber-600 text-stone-950"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Salva modifiche
          </Button>
        </div>
      </div>
    </div>
  );
}
