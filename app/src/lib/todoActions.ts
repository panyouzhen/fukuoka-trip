import { randomUUID } from './uuid'
import { supabase } from './supabase'
import type { Todo } from './types'

export async function addTodo(text: string, dueDate: string | null) {
  const row = { id: randomUUID(), text, due_date: dueDate, done: false }
  const { data, error } = await supabase.from('todos').insert(row).select().single()
  if (error) throw error
  return data as Todo
}

export async function updateTodo(id: string, patch: Partial<Todo>) {
  const { error } = await supabase.from('todos').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTodo(id: string) {
  const { error } = await supabase.from('todos').delete().eq('id', id)
  if (error) throw error
}
