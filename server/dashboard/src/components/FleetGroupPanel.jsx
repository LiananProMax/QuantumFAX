function FleetGroupPanel({ groups }) {
  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950/75 p-4">
      <h2 className="text-base font-semibold text-white">舰船分组</h2>
      <div className="mt-3 space-y-2">
        {(groups || []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-700 px-4 py-5 text-center text-sm text-slate-500">
            暂无分组统计。
          </div>
        ) : (
          groups.map((item) => (
            <div key={item.shipType} className="flex items-center justify-between rounded-xl bg-slate-900/70 px-3 py-2 text-sm">
              <span className="truncate text-slate-300">{item.shipTypeLabel}</span>
              <span className="shrink-0 text-slate-500">
                在线 {item.online} / 总计 {item.total}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

export default FleetGroupPanel;
