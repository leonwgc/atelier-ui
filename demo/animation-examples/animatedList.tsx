import { useDemoLocale } from '../locale';
import { useRef, useState } from 'react';
import { Button } from '../../src/entries/button';
import { AnimatedList } from '../../src/entries/animated-list';
import './styles.css';

export default function Example() {
  const { t: dt } = useDemoLocale();

  const [activities, setActivities] = useState([
    { id: 1, title: dt("工作区已创建"), detail: dt("团队可以开始协作了") },
  ]);
  const nextId = useRef(2);

  function addActivity() {
    const id = nextId.current++;
    setActivities((items) => [...items, { id, title: dt("新动态 {0}", { 0: id }), detail: dt("此条内容刚刚加入列表") }]);
  }

  function reset() {
    setActivities([{ id: nextId.current++, title: dt("工作区已创建"), detail: dt("团队可以开始协作了") }]);
  }

  return (
    <div className="animation-demo">
      <div className="animation-demo__toolbar">
        <Button disabled={activities.length >= 6} onClick={addActivity}>{dt("添加动态")}</Button>
        <Button variant="tertiary" onClick={reset}>{dt("重置列表")}</Button>
        <span className="animation-demo__hint">{dt("最多添加 6 项，观察新增项的进入动画")}</span>
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
