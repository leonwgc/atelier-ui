import { useId, useState } from 'react';
import { Button } from '../../src/entries/button';
import { Expand } from '../../src/entries/expand';
import './styles.css';

export default function Example() {
  const [open, setOpen] = useState(false);
  const panelId = useId();

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          {open ? '收起项目详情' : '展开项目详情'}
        </Button>
        <span className="animation-demo__hint">观察内容高度的平滑变化</span>
      </div>
      <div className="animation-demo__stage">
        <div className="animation-demo__summary"><strong>品牌体验升级</strong><span className="animation-demo__badge">进行中</span></div>
        <Expand id={panelId} open={open} duration={450}>
          <div className="animation-demo__details">
            <p>统一品牌视觉、梳理关键交互，并建立可复用的组件规范。</p>
            <p>负责人：Alex Morgan · 下次评审：周五</p>
          </div>
        </Expand>
      </div>
    </div>
  );
}
