import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

function Comments({ postId: postIdProp }) {
  const { postId: routePostId } = useParams();
  const postId = postIdProp || routePostId;

  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [editingComment, setEditingComment] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingComment, setDeletingComment] = useState(null);

  const currentUserId = localStorage.getItem("userId");

  const fetchComments = async () => {
    if (!postId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await API.get(`/comments/post/${postId}`);
      setComments(response.data.comments || []);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreateComment = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      alert("Comment content is required");
      return;
    }

    try {
      setCreating(true);

      const response = await API.post(`/comments/post/${postId}`, {
        content: content.trim(),
      });

      setComments((current) => [
        response.data.comment,
        ...current,
      ]);

      setContent("");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create comment");
    } finally {
      setCreating(false);
    }
  };

  const handleEditComment = async (commentId) => {
    if (!editContent.trim()) {
      alert("Comment content is required");
      return;
    }

    try {
      setSavingEdit(true);

      const response = await API.put(`/comments/${commentId}`, {
        content: editContent.trim(),
      });

      const updatedComment = response.data.comment;

      setComments((current) =>
        current.map((comment) =>
          comment._id === commentId
            ? { ...comment, ...updatedComment, content: editContent.trim() }
            : comment
        )
      );

      setEditingComment(null);
      setEditContent("");
      alert("Comment updated successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to update comment");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      setDeletingComment(commentId);

      await API.delete(`/comments/${commentId}`);

      setComments((current) =>
        current.filter((comment) => comment._id !== commentId)
      );

      alert("Comment deleted successfully");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete comment");
    } finally {
      setDeletingComment(null);
    }
  };

  if (loading) {
    return <p>Loading comments...</p>;
  }

  return (
    <div
      style={{
        marginTop: "20px",
        paddingTop: "15px",
        borderTop: "1px solid #ddd",
      }}
    >
      <h3>Comments</h3>

      <form onSubmit={handleCreateComment}>
        <textarea
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
          style={{
            width: "100%",
            padding: "10px",
            boxSizing: "border-box",
            marginBottom: "10px",
          }}
          required
        />

        <button type="submit" disabled={creating}>
          {creating ? "Posting..." : "Add Comment"}
        </button>
      </form>

      {comments.length === 0 ? (
        <p>No comments yet.</p>
      ) : (
        comments.map((comment) => {
          const creatorId =
            typeof comment.createdBy === "object"
              ? comment.createdBy?._id
              : comment.createdBy;

          const isOwner =
            currentUserId &&
            creatorId &&
            String(currentUserId) === String(creatorId);

          return (
            <div
              key={comment._id}
              style={{
                marginTop: "15px",
                padding: "10px",
                background: "#f7f7f7",
                borderRadius: "8px",
              }}
            >
              <strong>
                {comment.createdBy?.name || "Unknown User"}
              </strong>

              {editingComment === comment._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows="3"
                    style={{
                      width: "100%",
                      padding: "10px",
                      boxSizing: "border-box",
                    }}
                  />

                  <br /><br />

                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={() => handleEditComment(comment._id)}
                  >
                    {savingEdit ? "Saving..." : "Save Edit"}
                  </button>{" "}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingComment(null);
                      setEditContent("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <p>{comment.content}</p>
              )}

              {isOwner && editingComment !== comment._id && (
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingComment(comment._id);
                      setEditContent(comment.content || "");
                    }}
                  >
                    Edit Comment
                  </button>{" "}

                  <button
                    type="button"
                    disabled={deletingComment === comment._id}
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    {deletingComment === comment._id
                      ? "Deleting..."
                      : "Delete Comment"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}

export default Comments;