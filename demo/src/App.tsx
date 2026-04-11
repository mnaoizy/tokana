import { useState, useEffect, useRef } from "react";
import { createTokenizer, type Tokenizer, type IpadicToken } from "tokana";

export function App() {
  const [text, setText] = useState("東京都に住んでいる。");
  const [tokens, setTokens] = useState<IpadicToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const tokenizerRef = useRef<Tokenizer<IpadicToken> | null>(null);

  useEffect(() => {
    let cancelled = false;
    createTokenizer({ format: "ipadic", dicPath: "/dict" })
      .then((t) => {
        if (!cancelled) {
          tokenizerRef.current = t;
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const analyze = () => {
    if (!tokenizerRef.current || !text.trim()) return;
    setTokens(tokenizerRef.current.tokenize(text));
  };

  if (loading) {
    return <div className="container"><p>辞書を読み込み中...</p></div>;
  }

  if (error) {
    return (
      <div className="container">
        <h1>tokana Demo</h1>
        <div className="error">
          <h2>辞書の読み込みに失敗しました</h2>
          <p>
            <code>demo/public/dict/</code> に辞書ファイル（<code>.dat.gz</code>）を配置してください。
          </p>
          <h3>セットアップ手順</h3>
          <pre className="setup-cmd">npm run setup-dict</pre>
          <p>
            または手動で <a href="https://github.com/taku910/mecab/tree/master/mecab-ipadic">mecab-ipadic</a> のソースを取得し、
            <code>npx tokana build &lt;source-dir&gt; public/dict</code> でコンパイルしてください。
          </p>
          <details>
            <summary>エラー詳細</summary>
            <pre>{error}</pre>
          </details>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>tokana Demo</h1>
      <div className="input-area">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="日本語テキストを入力..."
        />
        <button onClick={analyze}>解析</button>
      </div>

      {tokens.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>表層形</th>
              <th>品詞</th>
              <th>品詞細分類1</th>
              <th>原形</th>
              <th>読み</th>
              <th>発音</th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token, i) => (
              <tr key={i}>
                <td>{token.surface}</td>
                <td>{token.pos}</td>
                <td>{token.posDetail1}</td>
                <td>{token.baseForm}</td>
                <td>{token.reading}</td>
                <td>{token.pronunciation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
