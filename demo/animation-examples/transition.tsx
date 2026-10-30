import { useDemoLocale } from '../locale';
import { useId, useState } from 'react';
import { Button } from '../../src/entries/button';
import { Transition } from '../../src/entries/transition';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [open, setOpen] = useState(true);
  const panelId = useId();

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          {open ? dt("收起筛选面板") : dt("展开筛选面板")}
        </Button>
        <span className="animation-demo__hint" aria-live="polite">{open ? dt("面板已展开") : dt("面板已收起")}</span>
      </div>
      <div id={panelId} className="animation-demo__stage animation-demo__transition-stage">
        <Transition in={open} animation="collapse" timeout={450}>
          <article className="animation-demo__card">
            <span className="animation-demo__badge">{dt("筛选条件")}</span>
            <strong>{dt("项目筛选")}</strong>
            <p>{dt("当前条件：进行中 · 设计团队 · 本月更新")}</p>
          </article>
        </Transition>
      </div>
    </div>
  );
}
