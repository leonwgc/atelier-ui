import { useDemoLocale, translateDemoValue } from './locale';
import { ApiTable, CodeBlock, ExampleCard, PageHeading } from './shared';
import { animationExamples } from './animation-examples';
import exampleStyles from './animation-examples/styles.css?raw';

export type AnimationPageId = 'marquee' | 'numberTicker' | 'typingAnimation' | 'blurFade' | 'fadeIn' | 'slideIn' | 'scrollReveal' | 'scaleIn' | 'stagger' | 'expand' | 'pulse' | 'glow' | 'shake' | 'wobble' | 'hoverLift' | 'press' | 'flipIn' | 'flipCard' | 'confetti' | 'shimmer' | 'animatedList' | 'transition' | 'transitionGroup' | 'borderBeam';
type ApiRow = [string, string, string];

interface AnimationPageMeta {
  id: AnimationPageId;
  title: string;
  icon: string;
  description: string;
  rows: ApiRow[];
}

export const animationPages: AnimationPageMeta[] = [
  {
    id: 'marquee', title: 'Marquee 滚动展示', icon: '⇢', description: '以连续循环的轨道展示标签、动态或品牌内容。',
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '28 秒'], ['direction', "'left' | 'right'", 'left'], ['pauseOnHover', 'boolean', 'true'], ['gradient', 'boolean', 'false']],
  },
  {
    id: 'numberTicker', title: 'NumberTicker 数值滚动', icon: '↗', description: '使用缓动数字递增强调统计值和关键指标。',
    rows: [['value', 'number', 'required'], ['startValue', 'number', '0'], ['duration', 'number', '1200 ms'], ['delay', 'number', '0 ms'], ['decimals', 'number', '0'], ['locale', 'string', 'zh-CN'], ['prefix / suffix', 'string', '—']],
  },
  {
    id: 'typingAnimation', title: 'TypingAnimation 打字效果', icon: '▏', description: '逐字输入、停顿并轮播多段短文案。',
    rows: [['words', 'string[]', 'required'], ['typeSpeed', 'number', '75 ms'], ['deleteSpeed', 'number', '38 ms'], ['pauseDuration', 'number', '1300 ms'], ['loop', 'boolean', 'true'], ['cursor', 'boolean', 'true']],
  },
  {
    id: 'blurFade', title: 'BlurFade 模糊渐入', icon: '◌', description: '让内容以轻微位移和模糊渐显，支持错峰延迟。',
    rows: [['children', 'ReactNode', 'required'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['blur', 'number', '6 px'], ['offsetY', 'number', '8 px']],
  },
  {
    id: 'fadeIn', title: 'FadeIn 淡入', icon: '◦', description: '让内容以轻柔的透明度渐变进入，可配置延迟与时长。',
    rows: [['children', 'ReactNode', 'required'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'slideIn', title: 'SlideIn 滑入', icon: '⇲', description: '让内容从指定方向平滑滑入，同时淡入显示。',
    rows: [['children', 'ReactNode', 'required'], ['direction', "'left' | 'right' | 'up' | 'down'", 'up'], ['distance', 'number', '16 px'], ['delay', 'number', '0 ms'], ['duration', 'number', '500 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'scrollReveal', title: 'ScrollReveal 滚动显现', icon: '⌄', description: '元素进入视口时渐入，可选择方向、距离及是否重复触发。',
    rows: [['children', 'ReactNode', 'required'], ['direction', "'left' | 'right' | 'up' | 'down'", 'up'], ['distance', 'number', '16 px'], ['delay / duration', 'number', '0 / 600 ms'], ['threshold', 'number', '0.1'], ['rootMargin', 'string', '0px'], ['once', 'boolean', 'true']],
  },
  {
    id: 'scaleIn', title: 'ScaleIn 缩放弹入', icon: '⊙', description: '内容从较小比例平滑放大并淡入，适用于卡片、弹窗和菜单。',
    rows: [['children', 'ReactNode', 'required'], ['startScale', 'number', '0.88'], ['delay', 'number', '0 ms'], ['duration', 'number', '450 ms']],
  },
  {
    id: 'stagger', title: 'Stagger 错峰动画', icon: '☷', description: '以错峰顺序呈现任意子元素，适合标签、卡片和列表内容。',
    rows: [['children', 'ReactNode', 'required'], ['staggerDelay', 'number', '70 ms'], ['duration', 'number', '420 ms'], ['itemClassName', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'expand', title: 'Expand 平滑展开', icon: '⌄', description: '对受控内容进行平滑展开与收起，并隐藏折叠内容的辅助技术焦点。',
    rows: [['children', 'ReactNode', 'required'], ['open', 'boolean', 'required'], ['duration', 'number', '300 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'pulse', title: 'Pulse 呼吸', icon: '◉', description: '以柔和的循环缩放和透明度变化强调需要关注的内容。',
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '1400 ms'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'glow', title: 'Glow 柔光', icon: '✧', description: '在内容周围循环显示柔和光晕，可自定义颜色与速度。',
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '1800 ms']],
  },
  {
    id: 'shake', title: 'Shake 震动反馈', icon: '↔', description: '通过短促的水平抖动反馈错误或无效操作，可用 active 重新触发。',
    rows: [['children', 'ReactNode', 'required'], ['active', 'boolean', 'true'], ['duration', 'number', '650 ms']],
  },
  {
    id: 'wobble', title: 'Wobble 摇摆反馈', icon: '↝', description: '以轻微旋转摆动吸引注意，可用 active 控制播放与重播。',
    rows: [['children', 'ReactNode', 'required'], ['active', 'boolean', 'true'], ['duration', 'number', '900 ms']],
  },
  {
    id: 'hoverLift', title: 'HoverLift 悬停抬升', icon: '⌃', description: '鼠标悬停时轻微上浮，常用于卡片和可点击内容。',
    rows: [['children', 'ReactNode', 'required'], ['lift', 'number', '6 px'], ['duration', 'number', '500 ms']],
  },
  {
    id: 'press', title: 'Press 按压反馈', icon: '●', description: '指针按下时轻微缩小，提供即时的交互反馈。',
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '500 ms']],
  },
  {
    id: 'flipIn', title: 'FlipIn 翻转进入', icon: '⟳', description: '内容以 3D 翻转并淡入，可选择绕 X 或 Y 轴旋转。',
    rows: [['children', 'ReactNode', 'required'], ['direction', "'x' | 'y'", 'y'], ['delay', 'number', '0 ms'], ['duration', 'number', '600 ms']],
  },
  {
    id: 'flipCard', title: 'FlipCard 翻转卡片', icon: '▣', description: '通过外部状态控制卡片正反面翻转。',
    rows: [['front / back', 'ReactNode', 'required'], ['flipped', 'boolean', 'false'], ['direction', "'horizontal' | 'vertical'", 'horizontal'], ['HTML attributes', 'HTMLAttributes<HTMLDivElement>', '—']],
  },
  {
    id: 'confetti', title: 'Confetti 庆祝粒子', icon: '✳', description: '在内容周围播放轻量庆祝粒子，支持数量、颜色与时长。',
    rows: [['children', 'ReactNode', 'optional'], ['active', 'boolean', 'true'], ['count', 'number', '24'], ['duration', 'number', '1800 ms'], ['colors', 'string[]', '内置配色']],
  },
  {
    id: 'shimmer', title: 'Shimmer 流光', icon: '✧', description: '为内容表面添加柔和的掠光效果，可自定义高光颜色。',
    rows: [['children', 'ReactNode', 'required'], ['duration', 'number', '1800 ms'], ['highlight', 'string', '半透明白色']],
  },
  {
    id: 'animatedList', title: 'AnimatedList 列表渐入', icon: '☷', description: '以错峰渐入动画呈现动态列表内容。',
    rows: [['items', 'ReactNode[] | T[]', 'required'], ['renderItem', '(item: T, index: number) => ReactNode', '自定义结构化数据的列表项'], ['getItemKey', '(item: T, index: number) => Key', '—'], ['staggerDelay', 'number', '70 ms'], ['duration', 'number', '420 ms'], ['itemClassName', 'string', '—'], ['HTML attributes', 'HTMLAttributes<HTMLUListElement>', '—']],
  },
  {
    id: 'transition', title: 'Transition 单项过渡', icon: '↕', description: '为条件显示的面板或内容提供统一的进入、退出生命周期。',
    rows: [['in', 'boolean', 'true'], ['animation', "'fade' | 'slide-up' | 'collapse' | 'none'", 'fade'], ['timeout', 'number', '200 ms'], ['appear', 'boolean', 'false'], ['mountOnEnter / unmountOnExit', 'boolean', 'true'], ['exit', 'ReactNode', 'children'], ['classNames', 'string | Partial<Record<TransitionStatus, string>>', '—'], ['onEnter / onEntered', '(node: HTMLDivElement) => void', '—'], ['onExit / onExited', '(node: HTMLDivElement) => void', '—']],
  },
  {
    id: 'transitionGroup', title: 'TransitionGroup 动态项过渡', icon: '⇅', description: '按稳定 key 管理子项增删；表单数据立即变化，退场项仅保留视觉快照。',
    rows: [['children', 'keyed Transition elements', 'required'], ['className', 'string', '—'], ['exit snapshot', 'Transition.exit: ReactNode', 'optional'], ['removal', 'data is removed immediately', '—']],
  },
  {
    id: 'borderBeam', title: 'BorderBeam 边框流光', icon: '✧', description: '为重点内容添加可控颜色和速度的流动边框。',
    rows: [['children', 'ReactNode', 'required'], ['color', 'string', '#8b7dff'], ['duration', 'number', '5 秒'], ['paused', 'boolean', 'false'], ['className', 'string', '—']],
  },
];

export function isAnimationPageId(id: string): id is AnimationPageId {
  return animationPages.some((item) => item.id === id);
}

export function AnimationPage({ id }: { id: AnimationPageId }) {
  const { t: dt } = useDemoLocale();
  const localizedAnimationPages = translateDemoValue(animationPages, dt);

  const item = localizedAnimationPages.find((page) => page.id === id);
  if (!item) return null;
  const { Preview, code } = animationExamples[id];

  return <>
    <PageHeading eyebrow={dt("动画组件")} title={item.title} description={item.description} badge={item.title.split(' ')[0]} />
    <ExampleCard key={id} title={dt("交互示例")} description={dt("体验组件效果，再查看可直接使用的 TypeScript 示例及配套样式。")} code={code}>
      <Preview />
    </ExampleCard>
    <details className="animation-demo-styles" key={`${id}-styles`}>
      <summary>{dt("查看示例配套样式（styles.css）")}</summary>
      <CodeBlock code={exampleStyles} language="css" />
    </details>
    <ApiTable rows={item.rows} />
  </>;
}
