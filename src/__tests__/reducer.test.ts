import { describe, it, expect } from 'vitest'
import { reducer, INITIAL_STATE } from '../context/reducer'

describe('reducer — BU', () => {
  it('ADD_BU creates a business unit and selects it', () => {
    const state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Engineering', description: '' })
    expect(state.businessUnits).toHaveLength(1)
    expect(state.businessUnits[0].name).toBe('Engineering')
    expect(state.selectedBuId).toBe(state.businessUnits[0].id)
  })

  it('DELETE_BU removes the BU and clears selection', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    const id = state.businessUnits[0].id
    state = reducer(state, { type: 'DELETE_BU', id })
    expect(state.businessUnits).toHaveLength(0)
    expect(state.selectedBuId).toBeNull()
  })
})

describe('reducer — Item status', () => {
  it('CHANGE_ITEM_STATUS updates statusId and creates an activity entry', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    state = reducer(state, { type: 'ADD_PROJECT', name: 'P1', description: '', businessUnitIds: [state.businessUnits[0].id] })
    state = reducer(state, { type: 'ADD_ITEM', projectId: state.projects[0].id, title: 'My item' })
    const itemId = state.items[0].id
    state = reducer(state, { type: 'CHANGE_ITEM_STATUS', id: itemId, statusId: 'in-progress' })
    expect(state.items[0].statusId).toBe('in-progress')
    const activity = state.activityEntries.find(a => a.type === 'status_changed')
    expect(activity).toBeDefined()
    expect(activity?.description).toContain('In Progress')
  })
})

describe('reducer — SubTask', () => {
  it('TOGGLE_SUBTASK flips done and creates activity entry', () => {
    let state = reducer(INITIAL_STATE, { type: 'ADD_BU', name: 'Eng', description: '' })
    state = reducer(state, { type: 'ADD_PROJECT', name: 'P', description: '', businessUnitIds: [state.businessUnits[0].id] })
    state = reducer(state, { type: 'ADD_ITEM', projectId: state.projects[0].id, title: 'Item' })
    state = reducer(state, { type: 'ADD_SUBTASK', itemId: state.items[0].id, title: 'Do thing' })
    const stId = state.subTasks[0].id
    state = reducer(state, { type: 'TOGGLE_SUBTASK', id: stId })
    expect(state.subTasks[0].done).toBe(true)
    const activity = state.activityEntries.find(a => a.type === 'subtask_checked')
    expect(activity).toBeDefined()
  })
})

describe('reducer — UPDATE_ITEM deadline', () => {
  it('generates deadline_set activity when deadline is added', () => {
    const withItem = reducer(INITIAL_STATE, { type: 'ADD_ITEM', projectId: 'p1', title: 'Test' })
    const item = withItem.items[0]
    const after = reducer(withItem, { type: 'UPDATE_ITEM', id: item.id, deadline: '2026-12-31' })
    const acts = after.activityEntries.filter(a => a.itemId === item.id)
    const deadlineAct = acts.find(a => a.type === 'deadline_set')
    expect(deadlineAct).toBeDefined()
    expect(deadlineAct?.description).toContain('2026-12-31')
  })

  it('generates deadline_cleared activity when deadline is removed', () => {
    const withItem = reducer(INITIAL_STATE, { type: 'ADD_ITEM', projectId: 'p1', title: 'Test' })
    const item = withItem.items[0]
    const withDeadline = reducer(withItem, { type: 'UPDATE_ITEM', id: item.id, deadline: '2026-12-31' })
    const after = reducer(withDeadline, { type: 'UPDATE_ITEM', id: item.id, deadline: null })
    const acts = after.activityEntries.filter(a => a.itemId === item.id)
    const cleared = acts.find(a => a.type === 'deadline_cleared')
    expect(cleared).toBeDefined()
  })
})

describe('reducer — IMPORT_DATA', () => {
  it('replaces all data and sets a success toast', () => {
    const importData = { ...INITIAL_STATE, businessUnits: [{ id: 'x', name: 'Imported BU', description: '', createdAt: '' }] }
    const state = reducer(INITIAL_STATE, { type: 'IMPORT_DATA', data: importData })
    expect(state.businessUnits[0].name).toBe('Imported BU')
    expect(state.toast?.type).toBe('success')
  })
})
