import { COMMAND_GROUPS } from '../data';

export default function CommandMatrix() {
  return (
    <section className="command-matrix" id="commands">
      <header>
        <p className="eyebrow">Command coverage</p>
        <h2>Every feature comes with production-ready slash commands.</h2>
        <p>Plixi mirrors your bot surface so what you configure here lines up with the commands your members already use.</p>
      </header>
      <div className="command-grid">
        {COMMAND_GROUPS.map((group) => (
          <article key={group.title}>
            <h3>{group.title}</h3>
            <p>{group.description}</p>
            <ul>
              {group.commands.map((command) => (
                <li key={command}>{command}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
