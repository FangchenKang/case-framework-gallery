export function UsageGuidePage() {
  return (
    <section className="info-page" aria-labelledby="usage-guide-title">
      <p className="section-eyebrow">Local Knowledge Base</p>
      <h2 id="usage-guide-title">使用说明</h2>
      <div className="info-page__grid">
        <article>
          <h3>上传与入库</h3>
          <p>
            在“上传图形”页面选择 PNG、JPG、JPEG 或 SVG 文件，填写标题、研究主题、图形类型和适用场景后保存。
            上传内容会存入当前浏览器的本地 IndexedDB，不会发送到云端。
          </p>
        </article>
        <article>
          <h3>引用来源</h3>
          <p>
            引用来源是一个完整文本框，可以直接粘贴国标、APA、Chicago、论文标题、网址、书籍或会议论文信息。
            如果暂时不知道来源，也可以留空。
          </p>
        </article>
        <article>
          <h3>备份与迁移</h3>
          <p>
            本地浏览器数据可能因为清理缓存或更换设备而丢失。重要图库请定期导出 JSON 备份，并在新浏览器中导入恢复。
          </p>
        </article>
      </div>
    </section>
  );
}

