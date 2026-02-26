"use client"

import { Loader2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useDeleteBlogPost, type BlogPost } from "@/lib/hooks/use-blog"

interface DeleteBlogPostModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  post: BlogPost | null
}

export function DeleteBlogPostModal({ open, onOpenChange, post }: DeleteBlogPostModalProps) {
  const deleteMutation = useDeleteBlogPost()

  const handleDelete = async () => {
    if (!post) return
    try {
      await deleteMutation.mutateAsync(post.id)
      onOpenChange(false)
    } catch (err) {
      // error handled by mutation
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Delete Blog Post
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. The blog post and its cover image will be permanently deleted.
          </DialogDescription>
        </DialogHeader>

        {post && (
          <div className="py-4">
            <p className="text-sm text-gray-700">
              Are you sure you want to delete <span className="font-semibold">&quot;{post.title}&quot;</span>?
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
