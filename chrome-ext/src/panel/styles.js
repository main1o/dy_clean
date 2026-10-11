(function (g) {
  "use strict";

  g.DyCleanStyles = `
      :host{all:initial}
      *{box-sizing:border-box;margin:0;padding:0}

      .app{
        --p1:#8b5cf6; --p2:#d946ef;
        --ok:#34d399; --warn:#fbbf24; --err:#f43f5e;
        --bg:rgba(15,14,23,.80);
        --sunk:rgba(0,0,0,.26);
        --surface:rgba(255,255,255,.045); --surface-hi:rgba(255,255,255,.08);
        --line:rgba(255,255,255,.08); --line-hi:rgba(255,255,255,.14);
        --fg:#f3f2f8; --dim:#8b87a3;
        --r-lg:18px; --r-md:12px; --r-sm:9px;
        --ease:cubic-bezier(.32,.72,0,1);

        width:448px; color:var(--fg); user-select:none;
        font:13px/1.55 -apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif;
        -webkit-font-smoothing:antialiased;
        background:var(--bg);
        backdrop-filter:blur(30px) saturate(180%);
        -webkit-backdrop-filter:blur(30px) saturate(180%);
        border:1px solid var(--line); border-radius:var(--r-lg);
        box-shadow:0 34px 84px -22px rgba(0,0,0,.82),
                   0 0 0 1px rgba(255,255,255,.035) inset;
        overflow:hidden; position:relative;
        display:flex; flex-direction:column;
        max-height:calc(100vh - 36px);
      }
      @media (prefers-color-scheme:light){
        .app{
          --bg:rgba(252,251,255,.84);
          --sunk:rgba(20,16,38,.045);
          --surface:rgba(28,20,54,.04); --surface-hi:rgba(28,20,54,.07);
          --line:rgba(28,20,54,.09); --line-hi:rgba(28,20,54,.16);
          --fg:#171425; --dim:#6b6588;
          box-shadow:0 34px 84px -24px rgba(30,20,60,.28),
                     0 0 0 1px rgba(255,255,255,.8) inset;
        }
      }

      .app::before{
        content:"";position:absolute;inset:0 0 auto;height:180px;pointer-events:none;
        background:radial-gradient(80% 100% at 0% 0%,rgba(139,92,246,.30),transparent 62%),
                   radial-gradient(70% 100% at 100% 0%,rgba(217,70,239,.18),transparent 60%);
      }

      .bubble{
        --p:0;
        position:relative; width:58px; height:58px; border:0; cursor:pointer;
        border-radius:50%; display:none; place-items:center;
        background:linear-gradient(150deg,rgba(38,32,58,.96),rgba(17,15,26,.97));
        box-shadow:0 16px 40px -12px rgba(0,0,0,.8),0 0 0 1px rgba(255,255,255,.07) inset;
        transition:transform .24s var(--ease), box-shadow .24s var(--ease);
        font-family:inherit; color:var(--fg);
      }
      @media (prefers-color-scheme:light){
        .bubble{
          background:linear-gradient(150deg,#fff,#f1eefb);
          box-shadow:0 16px 40px -14px rgba(30,20,60,.4),0 0 0 1px rgba(28,20,54,.07) inset;
        }
      }
      .bubble:hover{transform:scale(1.07)}
      .bubble:active{transform:scale(.95)}
      .bubble:focus-visible{outline:2px solid var(--p2);outline-offset:3px}
      .bubble > *{position:absolute;inset:0;display:grid;place-items:center}

      .bubble svg{width:100%;height:100%;transform:rotate(-90deg)}
      .bubble .ring-bg{fill:none;stroke:var(--line-hi);stroke-width:2.5}
      .bubble .ring-fg{
        fill:none;stroke:url(#dyGrad);stroke-width:2.5;stroke-linecap:round;
        stroke-dasharray:164; stroke-dashoffset:calc(164 - 164 * var(--p));
        transition:stroke-dashoffset .55s var(--ease);
      }
      .bubble .n{font-size:15px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.4px;line-height:1}
      .bubble .n .u{font-size:9px;font-weight:600;color:var(--dim);margin-left:2px}

      .app.busy .bubble .n{color:var(--p2)}
      .app.busy .bubble::after{
        content:"";position:absolute;inset:-3px;border-radius:50%;
        border:1.5px solid var(--p2);opacity:.5;
        animation:halo 1.8s ease-out infinite;
      }
      @keyframes halo{0%{transform:scale(.94);opacity:.55}100%{transform:scale(1.32);opacity:0}}
      .app.flash .bubble{animation:flash .6s var(--ease) 3}
      @keyframes flash{0%,100%{transform:scale(1)}50%{transform:scale(1.16)}}

      .app.collapsed{width:auto;background:transparent;border:0;box-shadow:none;backdrop-filter:none;-webkit-backdrop-filter:none;max-height:none}
      .app.collapsed::before{display:none}
      .app.collapsed .shell{display:none}
      .app.collapsed .bubble{display:grid}

      .shell{display:flex;flex-direction:column;min-height:0;flex:1 1 auto}

      .bar{
        display:flex;align-items:center;gap:10px;flex:none;
        padding:13px 15px;border-bottom:1px solid var(--line);position:relative;
      }
      .mark{
        width:26px;height:26px;flex:none;border-radius:9px;
        background:linear-gradient(140deg,var(--p1),var(--p2));
        display:grid;place-items:center;
        box-shadow:0 5px 16px -4px rgba(139,92,246,.9);
      }
      .mark svg{width:14px;height:14px;stroke:#fff;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}
      .name{font-weight:700;font-size:13px;letter-spacing:.2px}
      .name em{
        font-style:normal;font-size:10px;font-weight:600;color:var(--dim);
        margin-left:6px;letter-spacing:.2px;
      }
      .spacer{flex:1}

      .pill{
        display:inline-flex;align-items:center;gap:6px;flex:none;
        padding:4px 10px 4px 8px;border-radius:99px;
        background:var(--surface);border:1px solid var(--line);
        font-size:10.5px;font-weight:600;color:var(--dim);letter-spacing:.3px;
      }
      .pill i{
        width:6px;height:6px;border-radius:50%;background:var(--dim);flex:none;
        transition:background .2s;
      }
      .app.busy .pill{color:var(--p2);border-color:rgba(217,70,239,.35);background:rgba(139,92,246,.12)}
      .app.busy .pill i{background:var(--p2);animation:blip 1.15s ease-in-out infinite}
      .app.done .pill{color:var(--ok);border-color:rgba(52,211,153,.35);background:rgba(52,211,153,.10)}
      .app.done .pill i{background:var(--ok)}
      @keyframes blip{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.7)}}

      .icon-btn{
        width:28px;height:28px;flex:none;display:grid;place-items:center;
        border:0;border-radius:var(--r-sm);background:transparent;color:var(--dim);
        cursor:pointer;transition:background .15s,color .15s;
      }
      .icon-btn:hover{background:var(--surface-hi);color:var(--fg)}
      .icon-btn:focus-visible{outline:2px solid var(--p2);outline-offset:1px}
      .icon-btn svg{width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}

      .main{
        display:grid;grid-template-columns:190px 1fr;
        min-height:0;flex:1 1 auto;
      }

      .left{
        display:flex;flex-direction:column;gap:14px;
        padding:15px;border-right:1px solid var(--line);
        overflow-y:auto;overscroll-behavior:contain;
      }
      .left::-webkit-scrollbar{width:6px}
      .left::-webkit-scrollbar-thumb{background:var(--line-hi);border-radius:99px}

      .cap{
        font-size:10px;font-weight:600;color:var(--dim);
        letter-spacing:.8px;text-transform:uppercase;margin-bottom:-8px;
      }

      .opts{display:flex;flex-direction:column;gap:8px}
      .opts input{position:absolute;opacity:0;pointer-events:none}
      .opts label{
        display:flex;align-items:center;gap:10px;
        padding:10px 11px;border-radius:var(--r-md);cursor:pointer;
        background:var(--surface);border:1px solid transparent;
        transition:background .18s var(--ease),border-color .18s var(--ease),transform .18s var(--ease);
      }
      .opts label:hover{background:var(--surface-hi)}
      .opts label:active{transform:scale(.985)}
      .opts input:checked + label{
        border-color:rgba(139,92,246,.55);
        background:linear-gradient(135deg,rgba(139,92,246,.22),rgba(217,70,239,.08));
      }
      .opts input:checked + label .box{background:linear-gradient(140deg,var(--p1),var(--p2));border-color:transparent}
      .opts input:checked + label .box::after{transform:rotate(-45deg) scale(1)}
      .opts input:focus-visible + label{outline:2px solid var(--p2);outline-offset:2px}
      .opts input:disabled + label{opacity:.45;cursor:not-allowed}
      .opts .tx{display:flex;flex-direction:column;gap:1px;min-width:0}
      .opts .nm{font-weight:600;font-size:12.5px;line-height:1.15}
      .opts .sub{font-size:10px;color:var(--dim);line-height:1.15}

      .box{
        width:16px;height:16px;flex:none;border-radius:5px;
        border:1.5px solid var(--dim);display:grid;place-items:center;
        transition:background .18s var(--ease),border-color .18s var(--ease);
      }
      .box::after{
        content:"";width:7px;height:3.5px;margin-top:-2px;
        border-left:2px solid #fff;border-bottom:2px solid #fff;
        transform:rotate(-45deg) scale(0);
        transition:transform .18s var(--ease);
      }

      .note{
        display:flex;gap:8px;align-items:flex-start;
        padding:9px 10px;border-radius:var(--r-md);
        background:rgba(251,191,36,.09);border:1px solid rgba(251,191,36,.20);
        color:var(--dim);font-size:11px;line-height:1.5;
      }
      .note svg{width:13px;height:13px;flex:none;margin-top:2px;stroke:var(--warn);fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
      .note b{color:var(--warn);font-weight:600}

      .count{
        display:flex;align-items:baseline;gap:7px;
        padding:11px 12px;border-radius:var(--r-md);
        background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(217,70,239,.06));
        border:1px solid rgba(139,92,246,.24);
      }
      .count .v{
        font-size:26px;font-weight:700;font-variant-numeric:tabular-nums;
        line-height:1;letter-spacing:-1px;
        background:linear-gradient(135deg,var(--p1),var(--p2));
        -webkit-background-clip:text;background-clip:text;
        -webkit-text-fill-color:transparent;color:var(--p1);
      }
      .count .k{font-size:10.5px;color:var(--dim);letter-spacing:.4px}
      .mini{display:flex;gap:14px;margin-top:-6px}
      .mini div{display:flex;flex-direction:column;gap:2px}
      .mini .v{font-size:14px;font-weight:700;font-variant-numeric:tabular-nums;letter-spacing:-.3px}
      .mini .k{font-size:9.5px;color:var(--dim);letter-spacing:.3px}

      .cta{margin-top:auto;display:flex;flex-direction:column;gap:8px}

      .btn{
        display:flex;align-items:center;justify-content:center;gap:7px;
        border:0;border-radius:var(--r-md);padding:12px 14px;
        font-size:13px;font-weight:700;font-family:inherit;color:inherit;
        cursor:pointer;letter-spacing:.2px;white-space:nowrap;
        transition:filter .16s,transform .16s var(--ease),background .16s,border-color .16s,box-shadow .16s,color .16s;
      }
      .btn:focus-visible{outline:2px solid var(--p2);outline-offset:2px}
      .btn:disabled{cursor:not-allowed;opacity:.4}
      .btn svg{width:14px;height:14px;flex:none;stroke:currentColor;fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round}

      .btn-go{
        background:linear-gradient(135deg,var(--p1),var(--p2));color:#fff;
        box-shadow:0 8px 22px -8px rgba(139,92,246,.9);
      }
      .btn-go:not(:disabled):hover{filter:brightness(1.1);box-shadow:0 11px 28px -8px rgba(217,70,239,.95)}
      .btn-go:not(:disabled):active{transform:translateY(1px)}
      .btn-go.armed{
        background:transparent;color:var(--p2);
        border:2px dashed var(--p2);box-shadow:none;padding:10px 12px;
      }
      .btn-go.armed:not(:disabled):hover{background:rgba(217,70,239,.10);filter:none}

      .btn-halt{
        background:var(--surface);color:var(--dim);
        border:1px solid var(--line);font-size:12.5px;font-weight:600;padding:10px 14px;
      }
      .btn-halt:not(:disabled){color:var(--fg);border-color:var(--line-hi);background:var(--surface-hi)}
      .btn-halt:not(:disabled):hover{background:rgba(244,63,94,.13);border-color:rgba(244,63,94,.4);color:var(--err)}
      .btn-halt:not(:disabled):active{transform:translateY(1px)}

      .right{
        display:flex;flex-direction:column;min-width:0;min-height:0;
        padding:15px;gap:9px;
      }

      .prog{display:none;flex-direction:column;gap:7px;flex:none}
      .app.busy .prog{display:flex}
      .prog-top{display:flex;align-items:baseline;justify-content:space-between;gap:10px;font-size:11px;color:var(--dim)}
      .prog-top .lb{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .prog-top .pc{font-variant-numeric:tabular-nums;font-weight:600;color:var(--p2);flex:none}
      .bar{height:5px;border-radius:99px;background:var(--surface-hi);overflow:hidden;flex:none}
      .bar i{
        display:block;height:100%;width:0;border-radius:99px;
        background:linear-gradient(90deg,var(--p1),var(--p2));
        transition:width .45s var(--ease);
      }
      .bar.indet i{width:34%;animation:slide 1.3s var(--ease) infinite}
      @keyframes slide{0%{margin-left:-34%}100%{margin-left:100%}}

      .log-top{
        display:flex;align-items:center;gap:6px;flex:none;
        font-size:10px;font-weight:600;color:var(--dim);
        letter-spacing:.8px;text-transform:uppercase;
      }
      .log-top .spacer{flex:1}
      .log-top button{
        border:0;background:none;color:var(--dim);cursor:pointer;
        font:inherit;font-size:10.5px;text-transform:none;letter-spacing:0;
        padding:3px 7px;border-radius:7px;transition:background .15s,color .15s;
      }
      .log-top button:hover{background:var(--surface-hi);color:var(--fg)}

      .log{
        flex:1 1 auto;min-height:120px;overflow-y:auto;overscroll-behavior:contain;
        background:var(--sunk);border:1px solid var(--line);
        border-radius:var(--r-md);padding:5px;scroll-behavior:smooth;
      }
      .log::-webkit-scrollbar{width:6px}
      .log::-webkit-scrollbar-thumb{background:var(--line-hi);border-radius:99px}
      .log::-webkit-scrollbar-track{background:transparent}
      .log:empty::after{
        content:"等待开始…";display:block;padding:8px 9px;
        font:11px/1.6 ui-monospace,SFMono-Regular,Menlo,monospace;
        color:var(--dim);opacity:.5;
      }

      .row{
        display:grid;grid-template-columns:14px 1fr;gap:8px;align-items:start;
        padding:5px 8px;border-radius:var(--r-sm);
        font:11.5px/1.5 ui-monospace,SFMono-Regular,Menlo,monospace;
        word-break:break-word;animation:rowIn .24s var(--ease);
      }
      @keyframes rowIn{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
      .row + .row{margin-top:1px}
      .row .ic{width:14px;height:14px;margin-top:1.5px;display:grid;place-items:center;flex:none}
      .row .ic svg{width:11.5px;height:11.5px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round}
      .row .tx{color:var(--dim)}
      .row .tx .ts{opacity:.42;margin-right:7px;font-variant-numeric:tabular-nums;font-size:10.5px}

      .row.info .ic{color:var(--dim)}
      .row.ok{background:rgba(52,211,153,.075)}
      .row.ok .ic{color:var(--ok)}
      .row.ok .tx{color:#7fe0bf}
      .row.warn{background:rgba(251,191,36,.075)}
      .row.warn .ic{color:var(--warn)}
      .row.warn .tx{color:#f2cd7c}
      .row.error{background:rgba(244,63,94,.10)}
      .row.error .ic{color:var(--err)}
      .row.error .tx{color:#f7a3b0}
      @media (prefers-color-scheme:light){
        .row.ok{background:rgba(52,211,153,.13)}
        .row.warn{background:rgba(251,191,36,.14)}
        .row.error{background:rgba(244,63,94,.09)}
        .row.ok .tx{color:#0a7a4f}
        .row.warn .tx{color:#96660a}
        .row.error .tx{color:#b21f45}
      }
    `;
})(typeof window !== "undefined" ? window : globalThis);
