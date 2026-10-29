import { useRef, useState } from 'react';
import { Button } from '../../src/entries/button';
import { AnimatedList } from '../../src/entries/animated-list';
import './styles.css';

export default function Example() {
  const [activities, setActivities] = useState([
    { id: 1, title: '工作区已创建', detail: '团队可以开始协作了' },
  ]);
  const nextId = useRef(2);

  function addActivity() {
    const id = nextId.current++;
    setActivities((items) => [...items, { id, title: `新动态 ${id}`, detail: '此条内容刚刚加入列表' }]);
  }

  function reset() {
    setActivities([{ id: nextId.current++, title: '工作区已创建', detail: '团队可以开始协作了' }]);
  }

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button disabled={activities.length >= 6} onClick={addActivity}>添加动态</Button>
        <Button variant="tertiary" onClick={reset}>重置列表</Button>
        <span className="animation-demo__hint">最多添加 6 项，观察新增项的进入动画</span>
      </div>
      <AnimatedList
        items={activities}
        getItemKey={(activity) => activity.id}
        duration={600}
        staggerDelay={100}
        className="animation-demo__list"
        renderItem={(activity, index) => (
          <article className="animation-demo__activity">
            <span className="animation-demo__badge">{index + 1}</span>
            <div><strong>{activity.title}</strong><p>{activity.detail}</p></div>
          </article>
        )}
      />
    </div>
  );
}
