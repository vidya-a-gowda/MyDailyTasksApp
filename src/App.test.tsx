import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('renders starter tasks and summary stats', () => {
    render(<App />)

    expect(screen.getByText('Daily Tasks')).toBeInTheDocument()
    expect(screen.getByText('Plan the day')).toBeInTheDocument()
    expect(screen.getByText('Workout session')).toBeInTheDocument()
    expect(screen.getByText('Reply to messages')).toBeInTheDocument()
    expect(screen.getByText('Total')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Done')).toBeInTheDocument()
    expect(screen.getByText('Left')).toBeInTheDocument()
  })

  it('adds a new task from the form and resets the inputs', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Task title'), 'Write project update')
    await user.type(screen.getByLabelText('Notes'), 'Share roadmap and blockers with the team')
    await user.selectOptions(screen.getByLabelText('Category'), 'Work')
    await user.selectOptions(screen.getByLabelText('Priority'), 'High')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getByText('Write project update')).toBeInTheDocument()
    expect(screen.getByText('Share roadmap and blockers with the team')).toBeInTheDocument()
    expect(screen.getByLabelText('Task title')).toHaveValue('')
    expect(screen.getByLabelText('Notes')).toHaveValue('')
  })

  it('filters tasks by completion state', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.click(screen.getByRole('button', { name: 'completed' }))

    expect(screen.getByText('Reply to messages')).toBeInTheDocument()
    expect(screen.queryByText('Plan the day')).not.toBeInTheDocument()
    expect(screen.queryByText('Workout session')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'active' }))

    expect(screen.getByText('Plan the day')).toBeInTheDocument()
    expect(screen.getByText('Workout session')).toBeInTheDocument()
    expect(screen.queryByText('Reply to messages')).not.toBeInTheDocument()
  })

  it('uses starter tasks when local storage is empty, empty, or invalid', () => {
    window.localStorage.removeItem('daily-task-app-v1')
    const { unmount: unmountEmpty } = render(<App />)
    expect(screen.getByText('Plan the day')).toBeInTheDocument()
    unmountEmpty()

    window.localStorage.setItem('daily-task-app-v1', JSON.stringify([]))
    const { unmount: unmountEmptyArray } = render(<App />)
    expect(screen.getByText('Plan the day')).toBeInTheDocument()
    unmountEmptyArray()

    window.localStorage.setItem('daily-task-app-v1', '{')
    const { unmount: unmountInvalid } = render(<App />)
    expect(screen.getByText('Plan the day')).toBeInTheDocument()
    unmountInvalid()
  })

  it('uses the fallback ID generator when crypto.randomUUID is unavailable', async () => {
    const user = userEvent.setup()
    const originalCrypto = globalThis.crypto

    Object.defineProperty(globalThis, 'crypto', {
      value: undefined,
      configurable: true,
    })

    try {
      render(<App />)

      await user.type(screen.getByLabelText('Task title'), 'Fallback task id')
      await user.click(screen.getByRole('button', { name: 'Add task' }))

      expect(screen.getByText('Fallback task id')).toBeInTheDocument()
    } finally {
      Object.defineProperty(globalThis, 'crypto', {
        value: originalCrypto,
        configurable: true,
      })
    }
  })

  it('ignores blank submissions and keeps the task list unchanged', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Task title'), '   ')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    expect(screen.getAllByRole('button', { name: /Delete/i })).toHaveLength(3)
    expect(screen.queryByText('   ')).not.toBeInTheDocument()
  })

  it('renders task rows without notes as empty text blocks', async () => {
    const user = userEvent.setup()

    render(<App />)

    await user.type(screen.getByLabelText('Task title'), 'No notes task')
    await user.click(screen.getByRole('button', { name: 'Add task' }))

    const taskCard = screen.getByText('No notes task').closest('article')
    expect(taskCard).not.toBeNull()
    expect(taskCard?.querySelector('p')).toBeNull()
  })

  it('rejects malformed task entries in storage and falls back to starter tasks', () => {
    const malformedSets = [
      [{ id: '1', title: 'Broken', notes: 123, category: 'Personal', priority: 'High', completed: false, createdAt: '2024-01-01' }],
      [{ id: '1', title: 123, notes: 'Text', category: 'Personal', priority: 'High', completed: false, createdAt: '2024-01-01' }],
      [{ id: '1', title: 'Broken', notes: 'Text', category: 'Personal', priority: 'High', completed: 'yes', createdAt: '2024-01-01' }],
    ] as const

    malformedSets.forEach((malformedTasks) => {
      window.localStorage.setItem('daily-task-app-v1', JSON.stringify(malformedTasks))
      const { unmount } = render(<App />)
      expect(screen.getByText('Plan the day')).toBeInTheDocument()
      unmount()
    })
  })

  it('toggles, deletes, and clears completed tasks', async () => {
    const user = userEvent.setup()

    render(<App />)

    const toggleButtons = screen.getAllByRole('button', { name: /Mark task complete/ })
    await user.click(toggleButtons[0])
    expect(screen.getByText('Plan the day')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Delete Workout session' }))
    expect(screen.queryByText('Workout session')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Clear done' }))
    expect(screen.queryByText('Plan the day')).not.toBeInTheDocument()
    expect(screen.queryByText('Reply to messages')).not.toBeInTheDocument()
    expect(screen.getByText('No tasks here')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Clear done' })).toBeDisabled()
  })
})
