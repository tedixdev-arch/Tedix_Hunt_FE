import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { ProposedSignalRoute } from '../src/features/creator/ProposedSignalRoute'
import { readRouteProposal } from '../src/features/creator/routeResearch'
import { signalClujRouteProposal } from './fixtures/signalClujRouteProposal'

let root: Root, container: HTMLDivElement
beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  container = document.createElement('div'); document.body.append(container); root = createRoot(container)
})
afterEach(() => { act(() => root.unmount()); container.remove(); vi.unstubAllGlobals() })

test('seven ordered candidates expose actual details, sources, missing coordinates and pending walking concerns', () => {
  const raw = structuredClone(signalClujRouteProposal)
  raw.candidates.reverse()
  const proposal = readRouteProposal({ proposal: raw })!
  const inspect = vi.fn()
  act(() => root.render(<ProposedSignalRoute proposal={proposal} onInspect={inspect} />))
  const buttons = [...container.querySelectorAll('ol[aria-label="Ordered route candidates"] button')]
  expect(buttons.map(button => button.textContent!.split(' · ')[0])).toEqual(['CP1', 'CP2', 'CP3', 'CP4', 'CP5', 'CP6', 'FinishPoint'])
  expect(container.textContent).toContain('These are desk-researched landmark candidates, not physically verified arrival locations.')
  expect(container.textContent).toContain('Piața Unirii pedestrian crossings')
  expect(container.textContent).toContain('CP5/CP6 proximity and discovery-radius overlap')
  expect(container.textContent).toContain("Tailors' Tower approach and unnecessary crossings")
  expect(container.textContent).toContain('Accessibility and physical inspection remain pending')
  expect(container.textContent).not.toContain('Use suggested GPS')
  for (let index = 0; index < buttons.length; index++) {
    act(() => buttons[index].click())
    const candidate = signalClujRouteProposal.candidates[index]
    const detail = container.querySelector('section')!
    expect(detail.textContent).toContain(candidate.address)
    expect(detail.textContent).toContain(candidate.arrivalArea)
    expect(detail.textContent).toContain(candidate.confidence)
    expect(detail.textContent).toContain('Physical verification: pending')
    candidate.unresolvedIssues.forEach(issue => expect(detail.textContent).toContain(issue))
    const links = [...detail.querySelectorAll('a')]
    expect(links.map(link => link.href)).toEqual(signalClujRouteProposal.sources.filter(source => candidate.sourceIds.includes(source.id)).map(source => source.url))
    links.forEach(link => expect(link.rel).toBe('noreferrer'))
    expect(buttons[index].getAttribute('aria-expanded')).toBe('true')
    if (index < 5) {
      expect(detail.textContent).toContain('No researched reference coordinate available.')
      expect(inspect).toHaveBeenLastCalledWith(undefined)
    } else {
      expect(detail.textContent).toContain('Landmark reference only')
      expect(inspect).toHaveBeenLastCalledWith({ latitude: candidate.candidateGps!.latitude, longitude: candidate.candidateGps!.longitude, name: candidate.landmark })
    }
  }
  expect(raw.candidates[0].order).toBe(7)
  const walking = container.querySelector('details')!
  expect(walking.textContent).toContain('CP6 → FinishPoint')
  signalClujRouteProposal.walkingAssessment.legs.forEach(leg => expect(walking.textContent).toContain(leg.unresolved))
})
