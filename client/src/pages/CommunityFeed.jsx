
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";
import Comments from "./Comments";

const POSTS_PER_PAGE = 5;

function CommunityFeed() {
  const { communityId } = useParams();

  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [page, setPage] = useState(1);

  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [category, setCategory] = useState("General");
  const [tagsInput, setTagsInput] = useState("");

  const [creating, setCreating] = useState(false);
  const [likingPost, setLikingPost] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);
  const [reportingPost, setReportingPost] = useState(null);

  const currentUserId = localStorage.getItem("userId");

  const fetchPosts = async (pageNumber = 1, append = false) => {
    try {
      const response = await API.get(
        `/posts/community/${communityId}?page=${pageNumber}&limit=${POSTS_PER_PAGE}`
      );

      const newPosts = response.data.posts || [];

      setPosts((current) =>
        append ? [...current, ...newPosts] : newPosts
      );

      setPage(response.data.pagination?.page || pageNumber);
      setHasNextPage(
        response.data.pagination?.hasNextPage || false
      );
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to load posts."
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/admin/categories");

      const activeCategories = (
        response.data.categories || []
      ).filter((item) => item.isActive);

      setCategories(activeCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  useEffect(() => {
    setPosts([]);
    setPage(1);
    setHasNextPage(false);
    setLoading(true);

    fetchPosts(1, false);
    fetchCategories();
  }, [communityId]);

  const handleCreatePost = async (e) => {
    e.preventDefault();

    if (!content.trim() && !image) {
      alert("Post content or image is required.");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);

    try {
      setCreating(true);

      const formData = new FormData();
      formData.append("content", content.trim());
      formData.append("communityId", communityId);
      formData.append("category", category);
      formData.append("tags", JSON.stringify(tags));

      if (image) {
        formData.append("image", image);
      }

      const response = await API.post("/posts", formData);

      alert(
        response.data.message || "Post created successfully."
      );

      setContent("");
      setImage(null);
      setCategory("General");
      setTagsInput("");

      e.target.reset();

      setLoading(true);
      await fetchPosts(1, false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create post."
      );
    } finally {
      setCreating(false);
    }
  };

  const handleLoadMore = async () => {
    if (loadingMore || !hasNextPage) return;

    setLoadingMore(true);
    await fetchPosts(page + 1, true);
  };

  const handleLike = async (postId) => {
    try {
      setLikingPost(postId);

      await API.post(`/posts/${postId}/like`);
      await fetchPosts(1, false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update like."
      );
    } finally {
      setLikingPost(null);
    }
  };

  const handleEdit = async (postId) => {
    if (!editContent.trim()) {
      alert("Post content is required.");
      return;
    }

    try {
      setSavingEdit(true);

      await API.put(`/posts/${postId}`, {
        content: editContent.trim(),
      });

      setEditingPost(null);
      setEditContent("");

      await fetchPosts(1, false);
      alert("Post updated successfully.");
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update post."
      );
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (postId) => {
    if (
      !window.confirm("Are you sure you want to delete this post?")
    ) {
      return;
    }

    try {
      setDeletingPost(postId);

      await API.delete(`/posts/${postId}`);

      setPosts((current) =>
        current.filter((post) => post._id !== postId)
      );

      alert("Post deleted successfully.");
      await fetchPosts(1, false);
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete post."
      );
    } finally {
      setDeletingPost(null);
    }
  };

  const handleShare = async (postId) => {
    const link = `${window.location.origin}/communities/${communityId}/feed#post-${postId}`;

    try {
      await navigator.clipboard.writeText(link);
      alert("Post link copied successfully.");
    } catch {
      alert("Failed to copy post link.");
    }
  };

  const handleReport = async (postId) => {
    const reason = window.prompt(
      "Why are you reporting this post? Enter the reason:"
    );

    if (reason === null) return;

    if (!reason.trim()) {
      alert("Please enter a report reason.");
      return;
    }

    if (reason.trim().length > 500) {
      alert("Report reason cannot exceed 500 characters.");
      return;
    }

    try {
      setReportingPost(postId);

      const response = await API.post(
        `/posts/${postId}/report`,
        { reason: reason.trim() }
      );

      alert(
        response.data.message || "Post reported successfully."
      );
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to report post. Please try again."
      );
    } finally {
      setReportingPost(null);
    }
  };

  if (loading) {
    return <p>Loading posts...</p>;
  }

  return (
    <div style={styles.page}>
      <h1>Community Feed</h1>

      <form onSubmit={handleCreatePost} style={styles.form}>
        <h2>Create Post</h2>

        <textarea
          placeholder="What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          style={styles.input}
        />

        <label style={styles.label} htmlFor="postCategory">
          Category
        </label>

        <select
          id="postCategory"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={styles.input}
        >
          <option value="General">General</option>

          {categories
            .filter((item) => item.name !== "General")
            .map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
        </select>

        <label style={styles.label} htmlFor="postTags">
          Tags
        </label>

        <input
          id="postTags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g. hometown, events, news"
          style={styles.input}
        />

        <p style={styles.hint}>
          Enter multiple tags separated by commas.
        </p>

        <label style={styles.label} htmlFor="postImage">
          Upload Image (optional)
        </label>

        <input
          id="postImage"
          type="file"
          accept="image/*"
          onChange={(e) =>
            setImage(e.target.files?.[0] || null)
          }
        />

        <br />
        <br />

        <button type="submit" disabled={creating}>
          {creating ? "Creating..." : "Create Post"}
        </button>
      </form>

      {posts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        posts.map((post) => {
          const creatorId =
            typeof post.createdBy === "object"
              ? post.createdBy?._id
              : post.createdBy;

          const isOwner =
            currentUserId &&
            creatorId &&
            String(currentUserId) === String(creatorId);

          return (
            <div
              key={post._id}
              id={`post-${post._id}`}
              style={styles.post}
            >
              <p>
                <strong>
                  {post.createdBy?.name || "Unknown User"}
                </strong>
              </p>

              <p style={styles.categoryBadge}>
                Category: {post.category || "General"}
              </p>

              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div style={styles.tags}>
                  {post.tags.map((tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      style={styles.tag}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {editingPost === post._id ? (
                <>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={4}
                    style={styles.input}
                  />

                  <button
                    type="button"
                    disabled={savingEdit}
                    onClick={() => handleEdit(post._id)}
                  >
                    {savingEdit ? "Saving..." : "Save Edit"}
                  </button>{" "}

                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(null);
                      setEditContent("");
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {post.content && <p>{post.content}</p>}

                  {post.image && (
                    <img
                      src={post.image}
                      alt="Post"
                      style={styles.postImage}
                    />
                  )}
                </>
              )}

              <p>Likes: {post.likes?.length || 0}</p>

              <button
                type="button"
                onClick={() => handleLike(post._id)}
                disabled={likingPost === post._id}
              >
                {likingPost === post._id
                  ? "Updating..."
                  : "Like / Unlike"}
              </button>{" "}

              <button
                type="button"
                onClick={() => handleShare(post._id)}
              >
                Share Post
              </button>{" "}

              {!isOwner && (
                <button
                  type="button"
                  onClick={() => handleReport(post._id)}
                  disabled={reportingPost === post._id}
                >
                  {reportingPost === post._id
                    ? "Reporting..."
                    : "Report Post"}
                </button>
              )}{" "}

              {isOwner && editingPost !== post._id && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingPost(post._id);
                      setEditContent(post.content || "");
                    }}
                  >
                    Edit Post
                  </button>{" "}

                  <button
                    type="button"
                    disabled={deletingPost === post._id}
                    onClick={() => handleDelete(post._id)}
                  >
                    {deletingPost === post._id
                      ? "Deleting..."
                      : "Delete Post"}
                  </button>
                </>
              )}

              <p>
                Created:{" "}
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleString()
                  : "Unknown"}
              </p>

              <hr />
              <Comments postId={post._id} />
            </div>
          );
        })
      )}

      {hasNextPage && (
        <div style={styles.loadMore}>
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "Loading..." : "Load More Posts"}
          </button>
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 15px",
    fontFamily: "Arial, sans-serif",
    color: "#1f2937",
  },
  form: {
    border: "1px solid #ddd",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "30px",
    background: "#fff",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "12px",
    boxSizing: "border-box",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "7px",
  },
  hint: {
    fontSize: "13px",
    color: "#6b7280",
    marginTop: "-6px",
  },
  post: {
    border: "1px solid #ddd",
    padding: "20px",
    marginBottom: "20px",
    borderRadius: "10px",
    background: "#fff",
  },
  categoryBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "6px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: "14px",
  },
  tags: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
    marginBottom: "12px",
  },
  tag: {
    padding: "5px 9px",
    borderRadius: "20px",
    background: "#f3f4f6",
    color: "#374151",
    fontSize: "13px",
  },
  postImage: {
    width: "100%",
    maxWidth: "500px",
    borderRadius: "8px",
  },
  loadMore: {
    textAlign: "center",
    margin: "25px 0",
  },
};

export default CommunityFeed;
