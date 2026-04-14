import { useState } from "react";
import {
  useGetPostsQuery,
  useGetPostQuery,
  useGetUsersQuery,
  useGetCommentsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} from "./api";

export function App() {
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showUsers, setShowUsers] = useState(false);
  const [showComments, setShowComments] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "24px" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>RTK Devtools Demo</h1>
      <p style={{ color: "#6b7280", marginBottom: 24, fontSize: 14 }}>
        Click the <strong>RTK</strong> button in the bottom-right to open the
        devtools. Try triggering queries and mutations below to see them in the
        devtools.
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
        <button onClick={() => setShowUsers(!showUsers)} style={btnStyle}>
          {showUsers ? "Hide" : "Show"} Users
        </button>
      </div>

      {showUsers && <UsersSection />}

      <PostsSection
        selectedPostId={selectedPostId}
        onSelectPost={setSelectedPostId}
        showComments={showComments}
        onToggleComments={setShowComments}
      />
    </div>
  );
}

function UsersSection() {
  const { data: users, isLoading, error } = useGetUsersQuery();

  return (
    <div
      style={{
        marginBottom: 24,
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h2 style={{ fontSize: 18, marginBottom: 12 }}>Users</h2>
      {isLoading && <p>Loading users...</p>}
      {error && <p style={{ color: "red" }}>Error loading users</p>}
      {users && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {users.map((user) => (
            <div
              key={user.id}
              style={{
                padding: "8px 12px",
                background: "#f3f4f6",
                borderRadius: 6,
                fontSize: 13,
              }}
            >
              <strong>{user.name}</strong>
              <div style={{ color: "#6b7280", fontSize: 11 }}>{user.email}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PostsSection({
  selectedPostId,
  onSelectPost,
  showComments,
  onToggleComments,
}: {
  selectedPostId: number | null;
  onSelectPost: (id: number | null) => void;
  showComments: number | null;
  onToggleComments: (id: number | null) => void;
}) {
  const { data: posts, isLoading, error } = useGetPostsQuery();
  const [addPost] = useAddPostMutation();
  const [updatePost] = useUpdatePostMutation();
  const [deletePost] = useDeletePostMutation();

  const handleAddPost = () => {
    addPost({ title: "New Post", body: "This is a new post", userId: 1 });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: 18 }}>Posts</h2>
        <button
          onClick={handleAddPost}
          style={{ ...btnStyle, background: "#7e22ce", color: "#fff" }}
        >
          + Add Post
        </button>
      </div>

      {isLoading && <p>Loading posts...</p>}
      {error && <p style={{ color: "red" }}>Error loading posts</p>}

      <div style={{ display: "flex", gap: 16 }}>
        {/* Post list */}
        <div style={{ flex: 1 }}>
          {posts?.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                onSelectPost(post.id === selectedPostId ? null : post.id)
              }
              style={{
                padding: "12px 16px",
                marginBottom: 8,
                border: `1px solid ${post.id === selectedPostId ? "#7e22ce" : "#e5e7eb"}`,
                borderRadius: 8,
                cursor: "pointer",
                background: post.id === selectedPostId ? "#faf5ff" : "#fff",
                transition: "all 0.15s",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                #{post.id} {post.title.slice(0, 50)}
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>
                {post.body.slice(0, 80)}...
              </div>
              <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updatePost({
                      id: post.id,
                      title: post.title + " (updated)",
                    });
                  }}
                  style={{ ...smallBtnStyle }}
                >
                  Update
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePost(post.id);
                  }}
                  style={{ ...smallBtnStyle, color: "#ef4444" }}
                >
                  Delete
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleComments(showComments === post.id ? null : post.id);
                  }}
                  style={{ ...smallBtnStyle }}
                >
                  {showComments === post.id ? "Hide" : "Show"} Comments
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Post detail + comments */}
        {selectedPostId && (
          <div style={{ flex: 1 }}>
            <PostDetail postId={selectedPostId} />
          </div>
        )}
      </div>

      {showComments && <CommentsSection postId={showComments} />}
    </div>
  );
}

function PostDetail({ postId }: { postId: number }) {
  const { data: post, isLoading, error } = useGetPostQuery(postId);

  return (
    <div
      style={{
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h3 style={{ fontSize: 16, marginBottom: 8 }}>Post Detail</h3>
      {isLoading && <p>Loading post #{postId}...</p>}
      {error && <p style={{ color: "red" }}>Error loading post</p>}
      {post && (
        <>
          <h4 style={{ marginBottom: 8 }}>{post.title}</h4>
          <p style={{ fontSize: 13, color: "#4b5563" }}>{post.body}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>
            User ID: {post.userId}
          </p>
        </>
      )}
    </div>
  );
}

function CommentsSection({ postId }: { postId: number }) {
  const { data: comments, isLoading, error } = useGetCommentsQuery(postId);

  return (
    <div
      style={{
        marginTop: 16,
        padding: 16,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        background: "#fff",
      }}
    >
      <h3 style={{ fontSize: 16, marginBottom: 12 }}>
        Comments for Post #{postId}
      </h3>
      {isLoading && <p>Loading comments...</p>}
      {error && <p style={{ color: "red" }}>Error loading comments</p>}
      {comments?.map((comment) => (
        <div
          key={comment.id}
          style={{
            padding: 8,
            marginBottom: 8,
            background: "#f9fafb",
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <strong>{comment.name}</strong>
          <div style={{ color: "#6b7280", marginTop: 4 }}>
            {comment.body.slice(0, 100)}...
          </div>
        </div>
      ))}
    </div>
  );
}

const btnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "1px solid #d1d5db",
  borderRadius: 6,
  background: "#fff",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 500,
};

const smallBtnStyle: React.CSSProperties = {
  padding: "3px 8px",
  border: "1px solid #e5e7eb",
  borderRadius: 4,
  background: "#fff",
  cursor: "pointer",
  fontSize: 11,
  color: "#4b5563",
};
