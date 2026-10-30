import { act, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FadeIn } from '../../src/FadeIn';
import { SlideIn } from '../../src/SlideIn';
import { ScaleIn } from '../../src/ScaleIn';
import { BlurFade } from '../../src/BlurFade';
import { Pulse } from '../../src/Pulse';
import { Glow } from '../../src/Glow';
import { Shake } from '../../src/Shake';
import { Wobble } from '../../src/Wobble';
import { HoverLift } from '../../src/HoverLift';
import { Press } from '../../src/Press';
import { FlipIn } from '../../src/FlipIn';
import { Shimmer } from '../../src/Shimmer';
import { BorderBeam } from '../../src/BorderBeam';
import { Stagger } from '../../src/Stagger';
import { AnimatedList } from '../../src/AnimatedList';
import { Expand } from '../../src/Expand';
import { FlipCard } from '../../src/FlipCard';
import { Marquee } from '../../src/Marquee';
import { Confetti } from '../../src/Confetti';
import { ScrollReveal } from '../../src/ScrollReveal';
import { NumberTicker } from '../../src/NumberTicker';
import { TypingAnimation } from '../../src/TypingAnimation';
import { Transition, TransitionGroup } from '../../src/Transition';
import { Countdown } from '../../src/Statistic';

describe('CSS animation contracts', () => {
  it.each([
    ['fade-in', FadeIn], ['slide-in', SlideIn], ['scale-in', ScaleIn], ['blur-fade', BlurFade],
    ['pulse', Pulse], ['glow', Glow], ['shake', Shake], ['wobble', Wobble], ['hover-lift', HoverLift],
    ['press', Press], ['flip-in', FlipIn], ['shimmer', Shimmer],
  ] as const)('%s preserves content, classes and style overrides, and clamps duration', (name, Component) => {
    const { rerender } = render(<Component duration={-100} className="custom" data-testid="animation">Content</Component>);
    expect(screen.getByTestId('animation')).toHaveClass(`at-${name}`, 'custom'); expect(screen.getByTestId('animation')).toHaveTextContent('Content'); expect(screen.getByTestId('animation').style.getPropertyValue(`--at-${name}-duration`)).toBe('0ms');
    rerender(<Component style={{ [`--at-${name}-duration`]: '99ms' }} data-testid="animation">Content</Component>); expect(screen.getByTestId('animation').style.getPropertyValue(`--at-${name}-duration`)).toBe('99ms');
  });
  it.each(['left', 'right', 'up', 'down'] as const)('sets slide offsets for %s', (direction) => {
    render(<SlideIn direction={direction} distance={20} data-testid="slide">Content</SlideIn>);
    expect(screen.getByTestId('slide').style.getPropertyValue('--at-slide-in-x')).toBe(`${direction === 'left' ? -20 : direction === 'right' ? 20 : 0}px`);
    expect(screen.getByTestId('slide').style.getPropertyValue('--at-slide-in-y')).toBe(`${direction === 'up' ? 20 : direction === 'down' ? -20 : 0}px`);
  });
  it('clamps beam duration and reflects paused state', () => {
    const { container } = render(<BorderBeam paused duration={0} color="red">Content</BorderBeam>); expect(container.firstChild).toHaveClass('at-border-beam--paused'); expect(container.firstChild).toHaveStyle({ '--at-beam-duration': '0.5s', '--at-beam-color': 'red' });
  });
  it('stagger and animated lists assign progressive delays with stable keyed content', () => {
    const { container, rerender } = render(<Stagger staggerDelay={50}><span>A</span><span>B</span></Stagger>); expect(container.querySelectorAll('.at-stagger__item')[1]).toHaveStyle({ '--at-stagger-delay': '50ms' });
    rerender(<AnimatedList items={[{ id: 'b', text: 'B' }, { id: 'a', text: 'A' }]} getItemKey={(item) => item.id} renderItem={(item) => item.text} staggerDelay={20} />);
    expect(screen.getAllByRole('listitem')[1]).toHaveStyle({ '--at-animated-list-delay': '20ms' }); expect(screen.getAllByRole('listitem').map((el) => el.textContent)).toEqual(['B', 'A']);
  });
  it('hides closed Expand content from accessibility and makes it inert', () => {
    const { container, rerender } = render(<Expand open={false}><button>Action</button></Expand>); expect(container.firstChild).toHaveAttribute('aria-hidden', 'true'); expect(container.querySelector<HTMLElement>('.at-expand__inner')?.inert).toBe(true);
    rerender(<Expand open><button>Action</button></Expand>); expect(container.querySelector<HTMLElement>('.at-expand__inner')?.inert).toBe(false);
  });
  it('makes only the visible flip-card face interactive', () => {
    const { container, rerender } = render(<FlipCard front={<button>Front</button>} back={<button>Back</button>} />);
    expect(container.querySelector<HTMLElement>('.at-flip-card__face--back')?.inert).toBe(true);
    rerender(<FlipCard flipped direction="vertical" front="Front" back="Back" />); expect(container.querySelector<HTMLElement>('.at-flip-card__face--front')?.inert).toBe(true); expect(container.querySelector('.at-flip-card__face--back')).toHaveAttribute('aria-hidden', 'false');
  });
  it('hides marquee duplicates from accessibility and focus', () => {
    const { container } = render(<Marquee duration={-1}><button>Action</button></Marquee>); const groups = container.querySelectorAll<HTMLElement>('.at-marquee__group'); expect(groups).toHaveLength(2); expect(groups[1]).toHaveAttribute('aria-hidden', 'true'); expect(groups[1].inert).toBe(true); expect(container.firstChild).toHaveStyle({ '--at-marquee-duration': '0.5s' });
  });
  it.each([[-1, 0], [Infinity, 0], [200, 100], [2.5, 2]])('bounds confetti particle count %s', (count, expected) => {
    const { container } = render(<Confetti count={count} colors={[]} duration={-1}>Celebrate</Confetti>); expect(container.querySelectorAll('.at-confetti__particle')).toHaveLength(expected);
  });
});

describe('stateful animation', () => {
  it('reveals scroll content without IntersectionObserver', () => {
    render(<ScrollReveal data-testid="reveal">Content</ScrollReveal>); expect(screen.getByTestId('reveal')).toHaveAttribute('data-visible', 'true');
  });
  it('observes scroll visibility and disconnects on unmount', () => {
    let intersect: (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void = () => undefined;
    const disconnect = vi.fn(); const unobserve = vi.fn();
    class Observer {
      constructor(callback: typeof intersect) { intersect = callback; }
      observe() {} unobserve = unobserve; disconnect = disconnect;
    }
    vi.stubGlobal('IntersectionObserver', Observer);
    try {
      const { unmount } = render(<ScrollReveal once={false} data-testid="reveal">Content</ScrollReveal>);
      act(() => intersect([{ isIntersecting: true }])); expect(screen.getByTestId('reveal')).toHaveAttribute('data-visible', 'true');
      act(() => intersect([{ isIntersecting: false }])); expect(screen.getByTestId('reveal')).toHaveAttribute('data-visible', 'false'); unmount(); expect(disconnect).toHaveBeenCalledOnce();
    } finally { vi.unstubAllGlobals(); }
  });
  it('formats ticker endpoints instantly for zero duration and reduced motion', () => {
    const { rerender } = render(<NumberTicker value={1234.5} duration={0} decimals={1} locale="en-US" prefix="$" />); expect(screen.getByLabelText('$1,234.5')).toHaveTextContent('$1,234.5');
    vi.spyOn(window, 'matchMedia').mockReturnValue({ ...window.matchMedia(''), matches: true });
    rerender(<NumberTicker value={50} />); expect(screen.getByLabelText('50')).toHaveTextContent('50');
  });
  it('types words, settles without looping and clears timers', () => {
    vi.useFakeTimers(); const { container, unmount } = render(<TypingAnimation words={['AB']} typeSpeed={10} deleteSpeed={10} pauseDuration={10} loop={false} />);
    act(() => vi.advanceTimersByTime(20)); expect(container).toHaveTextContent('AB'); act(() => vi.advanceTimersByTime(50)); expect(container).toHaveTextContent('AB'); unmount(); expect(vi.getTimerCount()).toBe(0);
  });
  it('uses the first word for reduced motion and handles empty words', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ ...window.matchMedia(''), matches: true });
    const { container, rerender } = render(<TypingAnimation words={['First', 'Second']} />); expect(container).toHaveTextContent('First'); rerender(<TypingAnimation words={[]} />); expect(container.textContent).toBe('');
  });
  it('runs transition enter/exit callbacks and unmounts after timeout', () => {
    vi.useFakeTimers(); const enter = vi.fn(); const entered = vi.fn(); const exit = vi.fn(); const exited = vi.fn();
    const { rerender } = render(<Transition appear timeout={100} onEnter={enter} onEntered={entered} onExit={exit} onExited={exited}>Content</Transition>);
    expect(enter).toHaveBeenCalledOnce(); act(() => vi.advanceTimersByTime(100)); expect(entered).toHaveBeenCalledOnce();
    rerender(<Transition in={false} timeout={100} onExit={exit} onExited={exited}>Content</Transition>); expect(exit).toHaveBeenCalledOnce(); expect(screen.getByText('Content')).toBeInTheDocument(); act(() => vi.advanceTimersByTime(100)); expect(exited).toHaveBeenCalledOnce(); expect(screen.queryByText('Content')).toBeNull();
  });
  it('keeps removed TransitionGroup children until their exit finishes', () => {
    vi.useFakeTimers(); const { rerender } = render(<TransitionGroup><Transition key="a" timeout={50}>A</Transition><Transition key="b" timeout={50}>B</Transition></TransitionGroup>);
    act(() => vi.advanceTimersByTime(50)); rerender(<TransitionGroup><Transition key="b" timeout={50}>B</Transition></TransitionGroup>); expect(screen.getByText('A')).toBeInTheDocument(); act(() => vi.advanceTimersByTime(50)); expect(screen.queryByText('A')).toBeNull(); expect(screen.getByText('B')).toBeInTheDocument();
  });
  it('finishes countdown once and cancels its interval', () => {
    vi.useFakeTimers(); vi.setSystemTime(1000); const finish = vi.fn(); const { unmount } = render(<Countdown value={2000} onFinish={finish} />);
    act(() => vi.advanceTimersByTime(2000)); expect(finish).toHaveBeenCalledOnce(); expect(screen.getByText('00:00:00')).toBeInTheDocument(); unmount(); expect(vi.getTimerCount()).toBe(0);
  });
});
