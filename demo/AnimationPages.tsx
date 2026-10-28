import { useState, type ReactNode } from 'react';
import { highlightCode } from './shared';
import { AnimatedList, BlurFade, BorderBeam, Button, FadeIn, Input, Marquee, NumberTicker, Shimmer, SlideIn, Transition, TransitionGroup, TypingAnimation, useFieldArray, useForm } from '../src';

export type AnimationPageId = 'marquee' | 'numberTicker' | 'typingAnimation' | 'blurFade' | 'fadeIn' | 'slideIn' | 'shimmer' | 'animatedList' | 'transition' | 'transitionGroup' | 'borderBeam';
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