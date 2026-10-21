import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'daily-task-app-v1'

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `task-${Date.now()}-${Math.random().toString(16).slice(2)}`

const getStarterTasks = () => [
  {
    id: createId(),
    title: 'Plan the day',
    notes: 'Review priorities and set one key win for today.',
    category: 'Focus',
    priority: 'High',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: createId(),
    title: 'Workout session',
    notes: '30 minutes of movement and a quick stretch.',
    category: 'Health',
    priority: 'Medium',
    completed: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: createId(),
    title: 'Reply to messages',
    notes: 'Check inbox and respond to the important ones.',
    category: 'Personal',
    priority: 'Low',
    completed: true,
    createdAt: new Date().toISOString(),
  },
]

const formatToday = () =>
  new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date())

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const savedTasks = localStorage.getItem(STORAGE_KEY)
      if (!savedTasks) {
        return getStarterTasks()
      }

      const parsed = JSON.parse(savedTasks)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : getStarterTasks()
    } catch {
      return getStarterTasks()
    }
  })
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('Personal')
  const [priority, setPriority] = useState('Medium')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const stats = useMemo(() => {
    const total = tasks.length
    const completed = tasks.filter((task) => task.completed).length
    return {
      total,
      completed,
      remaining: total - completed,
    }
  }, [tasks])

  const visibleTasks = useMemo(() => {
    if (filter === 'active') {
      return tasks.filter((task) => !task.completed)
    }

    if (filter === 'completed') {
      return tasks.filter((task) => task.completed)
    }

    return tasks
  }, [filter, tasks])

  const addTask = (event) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      return
    }

    const newTask = {
      id: createId(),
      title: trimmedTitle,
      notes: notes.trim(),
      category,
      priority,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((currentTasks) => [newTask, ...currentTasks])
    setTitle('')
    setNotes('')
    setCategory('Personal')
    setPriority('Medium')
  }

  const toggleTask = (taskId) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    )
  }

  const deleteTask = (taskId) => {
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId))
  }

  const clearCompleted = () => {
    setTasks((currentTasks) => currentTasks.filter((task) => !task.completed))
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">✓</span>
          Daily Tasks
        </div>

        <div className="date-card">
          <p>Today</p>
          <h2>{formatToday()}</h2>
        </div>

        <div className="stat-grid">
          <div className="stat-card">
            <span>Total</span>
            <strong>{stats.total}</strong>
          </div>
          <div className="stat-card">
            <span>Done</span>
            <strong>{stats.completed}</strong>
          </div>
          <div className="stat-card highlight">
            <span>Left</span>
            <strong>{stats.remaining}</strong>
          </div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Focus list</p>
            <h1>Keep your day moving</h1>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={clearCompleted}
            disabled={stats.completed === 0}
          >
            Clear done
          </button>
        </header>

        <form className="task-form" onSubmit={addTask}>
          <div className="input-group">
            <label htmlFor="task-title" className="sr-only">
              Task title
            </label>
            <input
              id="task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Add a task for today"
            />
          </div>

          <div className="input-group">
            <label htmlFor="task-notes" className="sr-only">
              Notes
            </label>
            <textarea
              id="task-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Add a few details or context"
              rows="3"
            />
          </div>

          <div className="task-form-row">
            <label>
              <span>Category</span>
              <select value={category} onChange={(event) => setCategory(event.target.value)}>
                <option>Personal</option>
                <option>Work</option>
                <option>Health</option>
                <option>Study</option>
                <option>Errands</option>
              </select>
            </label>

            <label>
              <span>Priority</span>
              <select value={priority} onChange={(event) => setPriority(event.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
          </div>

          <button type="submit" className="primary-button">
            Add task
          </button>
        </form>

        <div className="list-toolbar">
          <span className="list-title">Tasks</span>
          <div className="filters" aria-label="Task filters">
            {['all', 'active', 'completed'].map((option) => (
              <button
                key={option}
                type="button"
                className={filter === option ? 'filter active' : 'filter'}
                onClick={() => setFilter(option)}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="task-list">
          {visibleTasks.length > 0 ? (
            visibleTasks.map((task) => (
              <article key={task.id} className={task.completed ? 'task-item done' : 'task-item'}>
                <button
                  type="button"
                  className="check-button"
                  aria-label={task.completed ? 'Mark task incomplete' : 'Mark task complete'}
                  onClick={() => toggleTask(task.id)}
                >
                  {task.completed ? '✓' : ''}
                </button>

                <div className="task-content">
                  <h3>{task.title}</h3>
                  {task.notes ? <p>{task.notes}</p> : null}
                  <div className="task-meta">
                    <span className={`badge category ${task.category.toLowerCase()}`}>
                      {task.category}
                    </span>
                    <span className={`badge priority ${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </article>
            ))
          ) : (
            <div className="empty-state">
              <h3>No tasks here</h3>
              <p>Try another filter or add a fresh task to get started.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
