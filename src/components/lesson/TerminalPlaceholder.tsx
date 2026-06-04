// Authentic terminal still. The interactive simulator lands in the next build;
// this is an honest preview of that pane, not a fake control.
export default function TerminalPlaceholder() {
  return (
    <div className="flex h-full min-h-[20rem] flex-col bg-terminal p-5 font-mono text-[0.8rem] leading-relaxed">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-wider text-fg-mute">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-success-bright" /> Terminal
      </div>
      <div className="space-y-0.5 text-fg-mute">
        <div><span className="text-success-bright">$</span> <span className="text-fg">claude</span></div>
        <div className="pl-3">Claude Code ready</div>
        <div className="pt-2"><span className="text-success-bright">›</span> <span className="text-fg">list my home directory</span></div>
        <div className="pl-3">I&rsquo;ll run <span className="text-command-bright">ls ~</span>. Approve?</div>
        <div className="pl-3">Desktop/&nbsp;&nbsp;Documents/&nbsp;&nbsp;Downloads/</div>
        <div className="pl-3 text-success-bright">Done ✓</div>
        <div className="pt-2">
          <span className="text-success-bright">›</span>{' '}
          <span className="inline-block h-[1.05em] w-[0.5em] translate-y-[0.15em] bg-success-bright motion-safe:animate-pulse" />
        </div>
      </div>
      <div className="mt-auto rounded-lg border border-dashed border-line px-3 py-2 text-xs leading-relaxed text-fg-mute">
        Hands-on simulator: type commands, get scripted output, bank the tip. Arriving in the next build.
      </div>
    </div>
  );
}
