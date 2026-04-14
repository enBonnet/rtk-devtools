import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

interface Post {
  id: number
  title: string
  body: string
  userId: number
}

interface User {
  id: number
  name: string
  email: string
  username: string
}

interface Comment {
  id: number
  postId: number
  name: string
  email: string
  body: string
}

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://jsonplaceholder.typicode.com' }),
  tagTypes: ['Post', 'User', 'Comment'],
  endpoints: (builder) => ({
    // Queries
    getPosts: builder.query<Post[], void>({
      query: () => '/posts?_limit=10',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Post' as const, id })),
              { type: 'Post', id: 'LIST' },
            ]
          : [{ type: 'Post', id: 'LIST' }],
    }),

    getPost: builder.query<Post, number>({
      query: (id) => `/posts/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    getUsers: builder.query<User[], void>({
      query: () => '/users?_limit=5',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getComments: builder.query<Comment[], number>({
      query: (postId) => `/posts/${postId}/comments`,
      providesTags: (_result, _error, postId) => [{ type: 'Comment', id: postId }],
    }),

    // Mutations
    addPost: builder.mutation<Post, Partial<Post>>({
      query: (body) => ({
        url: '/posts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Post', id: 'LIST' }],
    }),

    updatePost: builder.mutation<Post, Pick<Post, 'id'> & Partial<Post>>({
      query: ({ id, ...body }) => ({
        url: `/posts/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),

    deletePost: builder.mutation<void, number>({
      query: (id) => ({
        url: `/posts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: 'Post', id },
        { type: 'Post', id: 'LIST' },
      ],
    }),
  }),
})

export const {
  useGetPostsQuery,
  useGetPostQuery,
  useGetUsersQuery,
  useGetCommentsQuery,
  useAddPostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
} = api
