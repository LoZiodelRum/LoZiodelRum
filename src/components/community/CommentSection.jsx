import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageCircle, Heart, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function CommentSection({ articleId }) {
  const [newComment, setNewComment] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const queryClient = useQueryClient();

  // Chiamata database disattivata per sbloccare l'app
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => ({ username: "Ospite", email: "guest@example.com", role: "guest" }), // Mock dei dati
    retry: false
  });

  // Chiamata database disattivata
  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => [], // Restituisce un array vuoto invece di cercare nel DB
    enabled: !!articleId,
  });

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => Promise.resolve(commentData), // Disattivato
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
      setNewComment("");
      setReplyTo(null);
      toast.success("Commento pubblicato!");
    },
  });

  const likeCommentMutation = useMutation({
    mutationFn: ({ commentId, currentLikes }) => Promise.resolve(), // Disattivato
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    createCommentMutation.mutate({
      article_id: articleId,
      content: newComment,
      author_name: user.username || user.full_name,
      author_email: user.email,
      author_avatar: user.avatar,
      parent_id: replyTo?.id || null
    });
  };

  const topLevelComments = comments.filter(c => !c.parent_id);
  const getReplies = (commentId) => comments.filter(c => c.parent_id === commentId);

  const CommentCard = ({ comment, isReply = false }) => {
    const replies = getReplies(comment.id);

    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`${isReply ? 'ml-12' : ''}`}
      >
        <div className="bg-stone-900/50 rounded-xl p-4 border border-stone-800/50">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              {comment.author_avatar ? (
                <img src={comment.author_avatar} alt={comment.author_name} className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-amber-400 font-medium text-sm">
                  {comment.author_name?.[0]?.toUpperCase()}
                </span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-sm">{comment.author_name}</span>
                <span className="text-xs text-stone-500">
                  {new Date(comment.created_date).toLocaleDateString('it-IT', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </span>
              </div>
              
              <p className="text-stone-300 text-sm leading-relaxed mb-3">
                {comment.content}
              </p>
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => likeCommentMutation.mutate({ 
                    commentId: comment.id, 
                    currentLikes: comment.likes || 0 
                  })}
                  className="flex items-center gap-1 text-xs text-stone-500 hover:text-amber-400 transition-colors"
                >
                  <Heart className="w-3.5 h-3.5" />
                  {comment.likes || 0}
                </button>
                
                {!isReply && user && (
                  <button
                    onClick={() => setReplyTo(comment)}
                    className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    Rispondi
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {replies.map(reply => (
              <CommentCard key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="mt-12 pt-8 border-t border-stone-800/50">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5 text-amber-400" />
        <h2 className="text-2xl font-bold">
          Discussione ({comments.length})
        </h2>
      </div>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          {replyTo && (
            <div className="mb-3 p-3 bg-stone-900/50 rounded-lg border border-stone-800 flex items-center justify-between">
              <span className="text-sm text-stone-400">
                Rispondendo a <span className="text-stone-200">{replyTo.author_name}</span>
              </span>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="text-xs text-stone-500 hover:text-stone-300"
              >
                Annulla
              </button>
            </div>
          )}
          
          <div className="bg-stone-900/50 rounded-xl border border-stone-800/50 p-4">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Condividi la tua opinione..."
              className="bg-transparent border-0 text-stone-200 placeholder:text-stone-600 resize-none focus-visible:ring-0 mb-3"
              rows={3}
            />
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="bg-amber-500 hover:bg-amber-600 text-stone-950"
              >
                <Send className="w-4 h-4 mr-2" />
                Pubblica
              </Button>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-6 bg-stone-900/50 rounded-xl border border-stone-800/50 text-center">
          <p className="text-stone-400 mb-3">Accedi per partecipare alla discussione</p>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-stone-950"
          >
            Accedi
          </Button>
        </div>
      )}

      {/* Comments List */}
      <AnimatePresence>
        {isLoading ? (
          <div className="text-center py-8 text-stone-500">Caricamento...</div>
        ) : topLevelComments.length > 0 ? (
          <div className="space-y-4">
            {topLevelComments.map(comment => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="w-12 h-12 text-stone-700 mx-auto mb-3" />
            <p className="text-stone-500">
              Nessun commento ancora. Sii il primo a commentare!
            </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}