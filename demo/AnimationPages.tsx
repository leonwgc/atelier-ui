import { useState, type ReactNode } from 'react';
import { highlightCode } from './shared';
import { AnimatedList, BlurFade, BorderBeam, Button, Confetti, Expand, FadeIn, FlipCard, FlipIn, Glow, HoverLift, Input, Marquee, NumberTicker, Press, Pulse, ScaleIn, ScrollReveal, Shake, Shimmer, SlideIn, Stagger, Transition, TransitionGroup, TypingAnimation, Wobble, useFieldArray, useForm } from '../src';

export type AnimationPageId = 'marquee' | 'numberTicker' | 'typingAnimation' | 'blurFade' | 'fadeIn' | 'slideIn' | 'scrollReveal' | 'scaleIn' | 'stagger' | 'expand' | 'pulse' | 'glow' | 'shake' | 'wobble' | 'hoverLift' | 'press' | 'flipIn' | 'flipCard' | 'confetti' | 'shimmer' | 'animatedList' | 'transition' | 'transitionGroup' | 'borderBeam';
type ApiRow = [string, string, string];

interface AnimationPageMeta {
  id: AnimationPageId;
  title: string;
  icon: string;
  description: string;
  code: string;
  rows: ApiRow[];
  preview: ReactNode;
}

const activityItems = [
  { id: 'workspace', initials: 'W', title: 'Workspace created', description: 'Studio One is ready to use', time: '2 min ago' },
  { id: 'review', initials: 'D', title: 'Design review completed', description: 'All 8 comments were resolved', time: '18 min ago' },
  { id: 'release', initials: 'R', title: 'Release published', description: 'Version 2.4.0 is now live', time: '1 hr ago' },
];

function ExpandPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div className="animation-expand-demo">
      <Button size="sm" aria-expanded={open} aria-controls="animation-expand-demo-panel" onClick={() => setOpen((value) => !value)}>
        {open ? '收起内容' : '展开内容'}
      </Button>
      <Expand id="animation-expand-demo-panel" open={open} className="animation-expand-preview">
        <p>Additional details are revealed here.</p>
      </Expand>
    </div>
  );
}

export const animationPages: AnimationPageMeta[] = [
  {
    id: 'marquee', title: 'Marquee 滚动展示', icon: '⇢', description: '以连续循环的轨道展示标签、动态或品牌内容。',
    code: `import { Marquee } from 'atelier-ui/marquee';

export function ProjectMarquee() {
  return (
    <Marquee duration={24} gradient pauseOnHover>
      <span>Design systems</span>
      <span>Product teams</span>
      <span>Made to move</span>
    </Marquee>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '28 秒'], ['direction', "'left' | 'right'", 'left'], ['pauseOnHover', 'boolean', 'true'], ['gradient', 'boolean', 'false']],
    preview: <Marquee duration={12} gradient><span className="animation-pill">Design systems</span><span className="animation-pill">Product teams</span><span className="animation-pill">Made to move</span></Marquee>,
  },
  {
    id: 'numberTicker', title: 'NumberTicker 数值滚动', icon: '↗', description: '使用缓动数字递增强调统计值和关键指标。',
    code: `import { NumberTicker } from 'atelier-ui/number-ticker';

export function MonthlyRevenue() {
  return <NumberTicker value={12840} prefix="$" duration={1400} />;
}`,
    rows: [['value', 'number', 'required'], ['startValue', 'number', '0'], ['duration', 'number', '1200 ms'], ['delay', 'number', '0 ms'], ['decimals', 'number', '0'], ['locale', 'string', 'zh-CN'], ['prefix / suffix', 'string', '—']],
    preview: <div className="animation-number-preview"><NumberTicker value={12840} prefix="$" duration={1600} /></div>,
  },
  {
    id: 'typingAnimation', title: 'TypingAnimation 打字效果', icon: '▏', description: '逐字输入、停顿并轮播多段短文案。',
    code: `import { TypingAnimation } from 'atelier-ui/typing-animation';

export function RotatingHeadline() {
  return (
    <TypingAnimation
      words={['Build with clarity', 'Ship with confidence']}
      typeSpeed={65}
      pauseDuration={1200}
    />
  );
}`,
    rows: [['words', 'string[]', 'required'], ['typeSpeed', 'number', '75 ms'], ['deleteSpeed', 'number', '38 ms'], ['pauseDuration', 'number', '1300 ms'], ['loop', 'boolean', 'true'], ['cursor', 'boolean', 'true']],
    preview: <div className="animation-typing-preview"><TypingAnimation words={['Build with clarity', 'Ship with confidence']} typeSpeed={65} pauseDuration={1000} /></div>,
  },
  {
    id: 'blurFade', title: 'BlurFade 模糊渐入', icon: '◌', description: '让内容以轻微位移和模糊渐显，支持错峰延迟。',
    code: `import { BlurFade } from 'atelier-ui/blur-fade';

export function Intro() {
  return (
    <BlurFade delay={120} duration={600} blur={8} offsetY={12}>
      <h2>Every detail finds its place.</h2>
    </BlurFade>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['blur', 'number', '6 px'], ['offsetY', 'number', '8 px']],
    preview: <BlurFade key="blur-fade-demo" className="animation-fade-preview" delay={80} duration={850}><strong>Every detail finds its place.</strong></BlurFade>,
  },
  {
    id: 'fadeIn', title: 'FadeIn 淡入', icon: '◦', description: '让内容以轻柔的透明度渐变进入，可配置延迟与时长。',
    code: `import { FadeIn } from 'atelier-ui/fade-in';

export function Intro() {
  return (
    <FadeIn delay={120} duration={700}>
      <h2>Every detail finds its place.</h2>
    </FadeIn>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <FadeIn key="fade-in-demo" className="animation-fade-preview" delay={80} duration={850}><strong>Every detail finds its place.</strong></FadeIn>,
  },
  {
    id: 'slideIn', title: 'SlideIn 滑入', icon: '⇲', description: '让内容从指定方向平滑滑入，同时淡入显示。',
    code: `import { SlideIn } from 'atelier-ui/slide-in';

export function Intro() {
  return (
    <SlideIn direction="left" distance={24} delay={100} duration={600}>
      <h2>Every detail finds its place.</h2>
    </SlideIn>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['direction', "'left' | 'right' | 'up' | 'down'", 'up'], ['distance', 'number', '16 px'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <SlideIn key="slide-in-demo" className="animation-fade-preview" direction="left" distance={24} delay={80} duration={850}><strong>Every detail finds its place.</strong></SlideIn>,
  },
  {
    id: 'scrollReveal', title: 'ScrollReveal 滚动显现', icon: '⌄', description: '元素进入视口时渐入，可选择方向、距离及是否重复触发。',
    code: `import { ScrollReveal } from 'atelier-ui/scroll-reveal';

export function FeatureCard() {
  return (
    <ScrollReveal direction="up" distance={20} once>
      <article>
        <h2>Reveal on scroll</h2>
        <p>Content appears as it enters the viewport.</p>
      </article>
    </ScrollReveal>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['direction', "'left' | 'right' | 'up' | 'down'", 'up'], ['distance', 'number', '16 px'], ['delay / duration', 'number', '0 / 600 ms'], ['threshold', 'number', '0.1'], ['rootMargin', 'string', '0px'], ['once', 'boolean', 'true']],
    preview: <ScrollReveal key="scroll-reveal-demo" className="animation-fade-preview" direction="up"><strong>Reveal on scroll</strong></ScrollReveal>,
  },
  {
    id: 'scaleIn', title: 'ScaleIn 缩放弹入', icon: '⊙', description: '内容从较小比例平滑放大并淡入，适用于卡片、弹窗和菜单。',
    code: `import { ScaleIn } from 'atelier-ui/scale-in';

export function WelcomeCard() {
  return (
    <ScaleIn startScale={0.85} duration={450}>
      <article>Welcome back</article>
    </ScaleIn>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['startScale', 'number', '0.88'], ['delay', 'number', '0 ms'], ['duration', 'number', '450 ms']],
    preview: <ScaleIn key="scale-in-demo" className="animation-fade-preview"><strong>Welcome back</strong></ScaleIn>,
  },
  {
    id: 'stagger', title: 'Stagger 错峰动画', icon: '☷', description: '以错峰顺序呈现任意子元素，适合标签、卡片和列表内容。',
    code: `import { Stagger } from 'atelier-ui/stagger';

export function FeatureTags() {
  return (
    <Stagger staggerDelay={90}>
      <span>Fast setup</span>
      <span>Accessible</span>
      <span>Customizable</span>
    </Stagger>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['staggerDelay', 'number', '70 ms'], ['duration', 'number', '420 ms'], ['itemClassName', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <Stagger key="stagger-demo" className="animation-stagger-preview" staggerDelay={100}><span className="animation-pill">Fast setup</span><span className="animation-pill">Accessible</span><span className="animation-pill">Customizable</span></Stagger>,
  },
  {
    id: 'expand', title: 'Expand 平滑展开', icon: '⌄', description: '对受控内容进行平滑展开与收起，并隐藏折叠内容的辅助技术焦点。',
    code: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Expand } from 'atelier-ui/expand';

export function Details() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen((value) => !value)}>
        {open ? 'Hide details' : 'Show details'}
      </Button>
      <Expand open={open}>
        <p>Additional details are revealed here.</p>
      </Expand>
    </>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['open', 'boolean', 'required'], ['duration', 'number', '300 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <ExpandPreview />,
  },
  {
    id: 'pulse', title: 'Pulse 呼吸', icon: '◉', description: '以柔和的循环缩放和透明度变化强调需要关注的内容。',
    code: `import { Pulse } from 'atelier-ui/pulse';

export function LiveStatus() {
  return <Pulse duration={1400}><span>● Live now</span></Pulse>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '1400 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <Pulse className="animation-fade-preview"><strong>● Live now</strong></Pulse>,
  },
  {
    id: 'glow', title: 'Glow 柔光', icon: '✧', description: '在内容周围循环显示柔和光晕，可自定义颜色与速度。',
    code: `import { Glow } from 'atelier-ui/glow';

export function Highlight() {
  return <Glow color="#8b7dff" duration={1800}>Featured</Glow>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '1800 ms']],
    preview: <Glow className="animation-fade-preview"><strong>Featured</strong></Glow>,
  },
  {
    id: 'shake', title: 'Shake 震动反馈', icon: '↔', description: '通过短促的水平抖动反馈错误或无效操作，可用 active 重新触发。',
    code: `import { Shake } from 'atelier-ui/shake';

export function InvalidField() {
  return <Shake active><span role="alert">Please check this field.</span></Shake>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['active', 'boolean', 'true'], ['duration', 'number', '650 ms']],
    preview: <Shake key="shake-demo" className="animation-fade-preview"><strong>Invalid input</strong></Shake>,
  },
  {
    id: 'wobble', title: 'Wobble 摇摆反馈', icon: '↝', description: '以轻微旋转摆动吸引注意，可用 active 控制播放与重播。',
    code: `import { Wobble } from 'atelier-ui/wobble';

export function NewFeature() {
  return <Wobble active><span>New feature</span></Wobble>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['active', 'boolean', 'true'], ['duration', 'number', '900 ms']],
    preview: <Wobble key="wobble-demo" className="animation-fade-preview"><strong>New feature</strong></Wobble>,
  },
  {
    id: 'hoverLift', title: 'HoverLift 悬停抬升', icon: '⌃', description: '鼠标悬停时轻微上浮，常用于卡片和可点击内容。',
    code: `import { HoverLift } from 'atelier-ui/hover-lift';

export function ProjectCard() {
  return (
    <HoverLift lift={6}>
      <article>Explore the latest projects</article>
    </HoverLift>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['lift', 'number', '6 px'], ['duration', 'number', '500 ms']],
    preview: <HoverLift className="animation-interaction-preview"><strong>Hover to lift</strong></HoverLift>,
  },
  {
    id: 'press', title: 'Press 按压反馈', icon: '●', description: '指针按下时轻微缩小，提供即时的交互反馈。',
    code: `import { Press } from 'atelier-ui/press';

export function PressableCard() {
  return (
    <Press>
      <button type="button">Press and hold</button>
    </Press>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '500 ms']],
    preview: <Press className="animation-interaction-preview"><strong>Press and hold</strong></Press>,
  },
  {
    id: 'flipIn', title: 'FlipIn 翻转进入', icon: '⟳', description: '内容以 3D 翻转并淡入，可选择绕 X 或 Y 轴旋转。',
    code: `import { FlipIn } from 'atelier-ui/flip-in';

export function RevealCard() {
  return <FlipIn direction="y" duration={600}><article>Just revealed</article></FlipIn>;
}`,
    rows: [['children', 'ReactNode', 'required'], ['direction', "'x' | 'y'", 'y'], ['delay', 'number', '0 ms'], ['duration', 'number', '600 ms']],
    preview: <FlipIn key="flip-in-demo" className="animation-fade-preview"><strong>Just revealed</strong></FlipIn>,
  },
  {
    id: 'flipCard', title: 'FlipCard 翻转卡片', icon: '▣', description: '通过外部状态控制卡片正反面翻转。',
    code: `import { useState } from 'react';
import { FlipCard } from 'atelier-ui/flip-card';

export function MemberCard() {
  const [flipped, setFlipped] = useState(false);

  return (
    <div>
      <button type="button" onClick={() => setFlipped((value) => !value)}>
        Flip card
      </button>
      <FlipCard
        flipped={flipped}
        front={<strong>Alex Morgan</strong>}
        back={<span>Product designer</span>}
      />
    </div>
  );
}`,
    rows: [['front / back', 'ReactNode', 'required'], ['flipped', 'boolean', 'false'], ['direction', "'horizontal' | 'vertical'", 'horizontal'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
    preview: <FlipCard className="animation-flip-card" front={<strong>Alex Morgan</strong>} back={<span>Product designer</span>} />,
  },
  {
    id: 'confetti', title: 'Confetti 庆祝粒子', icon: '✳', description: '在内容周围播放轻量庆祝粒子，支持数量、颜色与时长。',
    code: `import { Confetti } from 'atelier-ui/confetti';

export function SuccessMessage() {
  return (
    <Confetti count={24} colors={['#7c3aed', '#06b6d4', '#f59e0b']}>
      <strong>Payment complete!</strong>
    </Confetti>
  );
}`,
    rows: [['children', 'ReactNode', 'optional'], ['active', 'boolean', 'true'], ['count', 'number', '24'], ['duration', 'number', '1800 ms'], ['colors', 'string[]', '内置配色']],
    preview: <div className="animation-confetti-preview"><Confetti><strong>Payment complete!</strong></Confetti></div>,
  },
  {
    id: 'shimmer', title: 'Shimmer 流光', icon: '✧', description: '为内容表面添加柔和的掠光效果，可自定义高光颜色。',
    code: `import { Shimmer } from 'atelier-ui/shimmer';

export function Highlight() {
  return (
    <Shimmer duration={1800}>
      <strong>Ready for the next release</strong>
    </Shimmer>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '1800 ms'], ['highlight', 'string', '半透明白色']],
    preview: <Shimmer className="animation-shimmer-preview"><strong>Ready for the next release</strong></Shimmer>,
  },
  {
    id: 'animatedList', title: 'AnimatedList 列表渐入', icon: '☷', description: '以错峰渐入动画呈现动态列表内容。',
    code: `import { AnimatedList } from 'atelier-ui/animated-list';

export function ActivityFeed() {
  const activities = [
    { id: 'workspace', initials: 'W', title: 'Workspace created', detail: 'Studio One is ready to use', time: '2 min ago' },
    { id: 'review', initials: 'D', title: 'Design review completed', detail: 'All 8 comments were resolved', time: '18 min ago' },
    { id: 'release', initials: 'R', title: 'Release published', detail: 'Version 2.4.0 is now live', time: '1 hr ago' },
  ];

  return (
    <AnimatedList
      items={activities}
      getItemKey={(activity) => activity.id}
      renderItem={(activity) => (
        <article className="activity-item">
          <span className="activity-item__avatar">{activity.initials}</span>
          <span className="activity-item__content">
            <strong>{activity.title}</strong>
            <small>{activity.detail}</small>
          </span>
          <time>{activity.time}</time>
        </article>
      )}
    />
  );
}`,
    rows: [['items', 'ReactNode[] | T[]', 'required'], ['renderItem', '(item: T, index: number) => ReactNode', '自定义结构化数据的列表项'], ['getItemKey', '(item: T, index: number) => Key', '—'], ['staggerDelay', 'number', '70 ms'], ['duration', 'number', '420 ms'], ['itemClassName', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLUListElement>', '—']],
    preview: <AnimatedList key="activity-list-demo" className="animation-list-preview" items={activityItems} getItemKey={(item) => item.id} renderItem={(item) => <article className="animation-list-preview__item"><span className="animation-list-preview__avatar">{item.initials}</span><span className="animation-list-preview__body"><strong>{item.title}</strong><small>{item.description}</small></span><time>{item.time}</time></article>} staggerDelay={120} />,
  },
  {
    id: 'transition', title: 'Transition 单项过渡', icon: '↕', description: '为条件显示的面板或内容提供统一的进入、退出生命周期。',
    code: `import { useState } from 'react';
import { Button } from 'atelier-ui/button';
import { Transition } from 'atelier-ui/transition';

export function FilterPanel() {
  const [open, setOpen] = useState(true);
  return (
    <>
      <Button onClick={() => setOpen((value) => !value)}>切换筛选面板</Button>
      <Transition in={open} animation="collapse" timeout={200}>
        <div>筛选条件与结果设置</div>
      </Transition>
    </>
  );
}`,
    rows: [['in', 'boolean', 'true'], ['animation', "'fade' | 'slide-up' | 'collapse' | 'none'", 'fade'], ['timeout', 'number', '200 ms'], ['appear', 'boolean', 'false'], ['mountOnEnter / unmountOnExit', 'boolean', 'true'], ['exit', 'ReactNode', 'children'], ['classNames', 'string | Partial<Record<TransitionStatus, string>>', '—'], ['onEnter / onEntered', '(node: HTMLDivElement) => void', '—'], ['onExit / onExited', '(node: HTMLDivElement) => void', '—']],
    preview: <SingleTransitionDemo />,
  },
  {
    id: 'transitionGroup', title: 'TransitionGroup 动态项过渡', icon: '⇅', description: '按稳定 key 管理子项增删；表单数据立即变化，退场项仅保留视觉快照。',
    code: `import { Button } from 'atelier-ui/button';
import { Input } from 'atelier-ui/input';
import { Transition } from 'atelier-ui/transition';
import { TransitionGroup } from 'atelier-ui/transition-group';
import { useFieldArray, useForm } from 'atelier-ui/form';

export function TeamMembers() {
  const form = useForm({ defaultValues: { members: [{ name: 'Alex Chen' }] } });
  const members = useFieldArray({ control: form.control, name: 'members' });
  return (
    <>
      <Button onClick={() => members.append({ name: '' })}>添加成员</Button>
      <TransitionGroup>
        {members.fields.map((member, index) => (
          <Transition key={member.id} animation="slide-up" timeout={200}
            exit={<div>{member.name || '未命名成员'} 已移除</div>}>
            <div>
              <Input aria-label={'成员 ' + (index + 1) + ' 姓名'} {...form.register('members.' + index + '.name')} />
              <button type="button" onClick={() => members.remove(index)}>移除</button>
            </div>
          </Transition>
        ))}
      </TransitionGroup>
    </>
  );
}`,
    rows: [['children', 'keyed Transition elements', 'required'], ['className', 'string', '—'], ['exit snapshot', 'Transition.exit: ReactNode', 'optional'], ['removal', 'data is removed immediately', '—']],
    preview: <TransitionGroupDemo />,
  },
  {
    id: 'borderBeam', title: 'BorderBeam 边框流光', icon: '✧', description: '为重点内容添加可控颜色和速度的流动边框。',
    code: `import { BorderBeam } from 'atelier-ui/border-beam';

export function HighlightCard() {
  return (
    <BorderBeam color="#2f9472" duration={5}>
      <strong>Ready for the next release</strong>
    </BorderBeam>
  );
}`,
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '5 秒'], ['paused', 'boolean', 'false'], ['className', 'string', '—']],
    preview: <BorderBeam color="#2f9472"><strong>Ready for the next release</strong></BorderBeam>,
  },
];

function SingleTransitionDemo() {
  const [open, setOpen] = useState(true);
  return <div className="animation-transition-demo"><Button size="sm" onClick={() => setOpen((value) => !value)}>切换筛选面板</Button><Transition in={open} animation="collapse" timeout={200}><div className="animation-transition-panel">筛选条件与结果设置</div></Transition></div>;
}

function TransitionGroupDemo() {
  const form = useForm<{ members: Array<{ name: string }> }>({ defaultValues: { members: [{ name: 'Alex Chen' }, { name: 'Morgan Lee' }] } });
  const members = useFieldArray<{ members: Array<{ name: string }> }, { name: string }>({ control: form.control, name: 'members' });
  return <div className="animation-transition-demo"><Button size="sm" onClick={() => members.append({ name: '' })}>＋ 添加成员</Button><TransitionGroup className="animation-transition-list">{members.fields.map((member, index) => <Transition key={member.id} animation="slide-up" timeout={200} exit={<div className="animation-transition-exit">{member.name || `成员 ${index + 1}`} 已移除</div>}><div className="animation-transition-row"><Input aria-label={`成员 ${index + 1} 姓名`} placeholder="成员姓名" {...form.register(`members.${index}.name`)} /><button type="button" className="animation-transition-remove" aria-label={`移除成员 ${index + 1}`} onClick={() => members.remove(index)}>×</button></div></Transition>)}</TransitionGroup></div>;
}

export function isAnimationPageId(id: string): id is AnimationPageId {
  return animationPages.some((item) => item.id === id);
}

export function AnimationPage({ id }: { id: AnimationPageId }) {
  const [showCode, setShowCode] = useState(false);
  const item = animationPages.find((page) => page.id === id);
  if (!item) return null;

  return <>
    <div className="page-heading">
      <div className="eyebrow"><span className="eyebrow__dot" />动画组件</div>
      <div className="page-heading__row"><div><h1>{item.title}</h1><p>{item.description}</p></div><span className="heading-badge">{item.title.split(' ')[0]}</span></div>
    </div>
    <section className="example-card">
      <div className="example-card__heading"><div><h3>交互示例</h3><p>体验组件效果，再查看可直接使用的 TypeScript 示例。</p></div><button type="button" className={`code-toggle ${showCode ? 'code-toggle--active' : ''}`} onClick={() => setShowCode((visible) => !visible)}><span>{`</>`}</span>{showCode ? '收起代码' : '查看完整代码'}</button></div>
      <div className="example-card__preview">{item.preview}</div>
      {showCode && <pre className="code-panel"><code dangerouslySetInnerHTML={{ __html: highlightCode(item.code) }} /></pre>}
    </section>
    <section className="api-table-section"><div className="eyebrow"><span className="eyebrow__dot" /> API REFERENCE</div><h2>组件属性</h2><div className="api-table-wrap"><table className="api-table"><thead><tr><th>属性</th><th>类型</th><th>默认值</th></tr></thead><tbody>{item.rows.map(([prop, type, fallback]) => <tr key={prop}><td><code>{prop}</code></td><td>{type}</td><td>{fallback}</td></tr>)}</tbody></table></div></section>
  </>;
}