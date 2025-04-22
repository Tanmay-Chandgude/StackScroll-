import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, ShareIcon, TrashIcon } from '@heroicons/react/24/outline'
import { supabase } from './lib/supabase'
import ReactMarkdown from 'react-markdown'

const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Blog', href: '/blog' },
  { name: 'Write', href: '/write' },
]

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
      <Disclosure as="nav" className="glass-nav sticky top-0 z-50">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <span className="text-xl font-bold text-green-500">StackScroll</span>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-300 hover:text-green-500"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  {user ? (
                    <button
                      onClick={() => supabase.auth.signOut()}
                      className="text-sm font-medium text-gray-300 hover:text-green-500"
                    >
                      Sign out
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="text-sm font-medium text-gray-300 hover:text-green-500"
                    >
                      Sign in
                    </Link>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-green-500">
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block py-2 pl-3 pr-4 text-base font-medium text-gray-300 hover:bg-gray-700 hover:text-green-500"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<BlogList user={user} />} />
          <Route 
            path="/write" 
            element={
              loading ? (
                <div>Loading...</div>
              ) : user ? (
                <WritePost user={user} />
              ) : (
                <Navigate to="/login" state={{ from: '/write' }} />
              )
            } 
          />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </main>
    </div>
  )
}

function Home() {
  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600">
        Share Your Technical Knowledge
      </h1>
      <p className="mt-6 text-lg leading-8 text-gray-300">
        Create and share in-depth technical articles with the developer community.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <Link
          to="/write"
          className="btn-green rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm"
        >
          Start Writing
        </Link>
        <Link
          to="/blog"
          className="text-sm font-semibold leading-6 text-gray-300 hover:text-green-500"
        >
          Read Articles <span aria-hidden="true">→</span>
        </Link>
      </div>
    </div>
  )
}

function BlogList({ user }) {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPost, setSelectedPost] = useState(null)
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    fetchPosts()
  }, [])

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error('Error fetching posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (postId) => {
    if (!confirm('Are you sure you want to delete this post?')) return

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId)

      if (error) throw error
      fetchPosts()
    } catch (error) {
      console.error('Error deleting post:', error)
    }
  }

  const handleShare = async (post) => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/blog/' + post.id)
      alert('Link copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  if (loading) {
    return <div className="text-center text-gray-300">Loading...</div>
  }

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight text-white mb-8">Latest Articles</h2>
      <div className="space-y-6">
        {posts.length === 0 ? (
          <p className="text-gray-400">No articles yet. Be the first to write one!</p>
        ) : (
          posts.map((post) => (
            <article key={post.id} className="glass-card p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white">{post.title}</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleShare(post)}
                    className="p-2 text-gray-400 hover:text-green-500"
                  >
                    <ShareIcon className="h-5 w-5" />
                  </button>
                  {user && user.id === post.user_id && (
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-2 text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>
              <div 
                className="mt-4 text-gray-300 prose prose-invert max-w-none"
                onClick={() => setSelectedPost(selectedPost === post ? null : post)}
              >
                <ReactMarkdown>
                  {selectedPost === post ? post.content : post.content.slice(0, 200) + '...'}
                </ReactMarkdown>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-400">
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedPost(selectedPost === post ? null : post)}
                  className="text-sm text-green-500 hover:text-green-400"
                >
                  {selectedPost === post ? 'Show less' : 'Read more'}
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}

function WritePost({ user }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [publishing, setPublishing] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setPublishing(true)
    setError(null)

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            title,
            content,
            user_id: user.id
          }
        ])

      if (error) throw error

      setTitle('')
      setContent('')
      navigate('/blog')
    } catch (error) {
      console.error('Error publishing post:', error)
      setError(error.message)
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="glass-card p-8">
      <h2 className="text-3xl font-bold tracking-tight text-white">Write an Article</h2>
      {error && (
        <div className="mt-4 p-4 bg-red-900/50 text-red-200 rounded-md">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full glass-input rounded-md p-2"
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-300">
            Content (Markdown supported)
          </label>
          <textarea
            name="content"
            id="content"
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="mt-1 block w-full glass-input rounded-md p-2"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={publishing}
            className="btn-green rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [mode, setMode] = useState('signin')
  const [successMessage, setSuccessMessage] = useState(null)
  const navigate = useNavigate()

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Password must be at least 6 characters long'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccessMessage(null)

    const passwordError = validatePassword(password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    try {
      if (mode === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes('Email not confirmed')) {
            setError('Please check your email to verify your account before signing in.')
          } else {
            setError('Invalid email or password. Please try again or sign up for a new account.')
          }
          return
        }

        navigate('/write')
      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) throw signUpError

        setSuccessMessage('Account created! Please check your email for verification.')
        setMode('signin')
      }
    } catch (error) {
      console.error('Auth error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 p-4 bg-red-900/50 text-red-200 rounded-md">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-900/50 text-green-200 rounded-md">
              {successMessage}
            </div>
          )}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full glass-input rounded-md p-2"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full glass-input rounded-md p-2"
                />
              </div>
              {mode === 'signup' && (
                <p className="mt-2 text-sm text-gray-400">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-green w-full rounded-md py-2 px-4 text-sm font-medium disabled:opacity-50"
              >
                {loading ? 'Processing...' : (mode === 'signin' ? 'Sign in' : 'Sign up')}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin')
                setError(null)
                setSuccessMessage(null)
              }}
              className="text-sm text-green-500 hover:text-green-400"
            >
              {mode === 'signin' 
                ? "Don't have an account? Sign up" 
                : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App