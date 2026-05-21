import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Square, Terminal, ExternalLink, ChevronRight, BookOpen, 
  Layers, Lock, Shield, Activity, TerminalSquare, AlertTriangle, RefreshCw 
} from 'lucide-react';
import { marked } from 'marked';
import { Terminal as Xterm } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

export default function App() {
  const [labs, setLabs] = useState([]);
  const [activeLab, setActiveLab] = useState(null);
  const [labContent, setLabContent] = useState('');
  const [dockerStatus, setDockerStatus] = useState('NOT_CONFIGURED'); // RUNNING, STOPPED, LOADING, NOT_CONFIGURED
  const [rightTab, setRightTab] = useState('terminal'); // terminal, gui
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const terminalRef = useRef(null);
  const xtermInstance = useRef(null);
  const socketInstance = useRef(null);
  const fitAddonInstance = useRef(null);

  // Khởi động: Lấy danh sách labs
  useEffect(() => {
    fetch('/api/labs')
      .then(res => res.json())
      .then(data => {
        setLabs(data);
        if (data.length > 0) {
          // Mặc định chọn bài lab đầu tiên
          selectLab(data[0]);
        }
      })
      .catch(err => console.error("Lỗi fetch labs list:", err));
  }, []);

  // Lắng nghe sự kiện resize để tự động fit terminal
  useEffect(() => {
    const handleResize = () => {
      if (fitAddonInstance.current) {
        fitAddonInstance.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Chọn bài lab mới
  const selectLab = async (lab) => {
    setLoading(true);
    setActiveLab(lab);
    setRightTab('terminal');
    
    // Check trạng thái docker
    checkStatus(lab);

    // Lấy nội dung tài liệu hướng dẫn (.md)
    try {
      const res = await fetch(`/api/lab-content?path=${encodeURIComponent(lab.path)}`);
      const data = await res.json();
      if (data.content) {
        setLabContent(marked.parse(data.content));
      } else {
        setLabContent(`<p class="text-red-500">❌ Không thể tải tài liệu hướng dẫn bài lab này.</p>`);
      }
    } catch (err) {
      setLabContent(`<p class="text-red-500">❌ Lỗi kết nối máy chủ.</p>`);
    }

    setLoading(false);

    // Reset và kết nối lại terminal cho thư mục bài lab tương ứng
    setTimeout(() => {
      initTerminal(lab);
    }, 100);
  };

  // Kiểm tra trạng thái docker
  const checkStatus = (lab) => {
    if (!lab.composePath) {
      setDockerStatus('NOT_CONFIGURED');
      return;
    }
    
    fetch(`/api/docker/status?composePath=${encodeURIComponent(lab.composePath)}`)
      .then(res => res.json())
      .then(data => {
        setDockerStatus(data.status);
      })
      .catch(() => setDockerStatus('STOPPED'));
  };

  // Khởi động môi trường Lab
  const startLab = async () => {
    if (!activeLab || !activeLab.composePath) return;
    setActionLoading(true);
    setDockerStatus('LOADING');
    try {
      const res = await fetch('/api/docker/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ composePath: activeLab.composePath })
      });
      const data = await res.json();
      if (data.success) {
        setDockerStatus('RUNNING');
      } else {
        alert("Lỗi khởi chạy: " + data.error);
        setDockerStatus('STOPPED');
      }
    } catch (err) {
      alert("Lỗi khởi chạy môi trường.");
      setDockerStatus('STOPPED');
    }
    setActionLoading(false);
  };

  // Dừng môi trường Lab
  const stopLab = async () => {
    if (!activeLab || !activeLab.composePath) return;
    setActionLoading(true);
    setDockerStatus('LOADING');
    try {
      const res = await fetch('/api/docker/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ composePath: activeLab.composePath })
      });
      const data = await res.json();
      if (data.success) {
        setDockerStatus('STOPPED');
      } else {
        alert("Lỗi tắt môi trường: " + data.error);
        setDockerStatus('RUNNING');
      }
    } catch (err) {
      alert("Lỗi tắt môi trường.");
      setDockerStatus('RUNNING');
    }
    setActionLoading(false);
  };

  // Khởi tạo Terminal Emulator (xterm.js)
  const initTerminal = (lab) => {
    // Đóng socket cũ nếu có
    if (socketInstance.current) {
      socketInstance.current.close();
    }
    // Dọn dẹp terminal cũ
    if (terminalRef.current) {
      terminalRef.current.innerHTML = '';
    }

    // Khởi tạo xterm instance
    const term = new Xterm({
      cursorBlink: true,
      fontFamily: 'Fira Code, var(--font-mono)',
      fontSize: 14,
      theme: {
        background: '#05070f',
        foreground: '#e5e7eb',
        cursor: '#38bdf8'
      }
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    xtermInstance.current = term;
    fitAddonInstance.current = fitAddon;

    term.write('🔒 Đang thiết lập kết nối mã hóa đến Workspace Container...\r\n');

    // Kết nối WebSocket
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}?dir=${encodeURIComponent(lab.composePath || '')}`;
    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      term.write('✅ Đã thiết lập kết nối an toàn! Chào mừng tới Workspace Terminal.\r\n\r\n');
    };

    ws.onmessage = (event) => {
      term.write(event.data);
    };

    ws.onclose = () => {
      term.write('\r\n🔌 Đã ngắt kết nối terminal.\r\n');
    };

    term.onData((data) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    socketInstance.current = ws;
  };

  return (
    <div className="app-container">
      {/* 1. THANH ĐIỀU HƯỚNG BÊN TRÁI (SIDEBAR) */}
      <div className="glass-panel" style={{ width: '320px', display: 'flex', flexDirection: 'column', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Header thương hiệu */}
        <div style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 800 }}>
            <Shield size={24} color="var(--primary-glow)" className="neon-text-blue" />
            <span>DEVSECOPS LABS</span>
          </h1>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Hệ thống tương tác All-in-One</p>
        </div>

        {/* Danh sách Labs */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 8px' }}>
          <h2 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', paddingLeft: '12px', marginBottom: '12px' }}>
            Bản Đồ Labs Thực Hành
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {labs.map((lab) => {
              const isActive = activeLab && activeLab.id === lab.id;
              return (
                <button
                  key={lab.id}
                  onClick={() => selectLab(lab)}
                  className="glow-hover"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: isActive ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)' : 'transparent',
                    border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: 700, 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      background: lab.level === 'EASY' ? 'rgba(16, 185, 129, 0.1)' : lab.level === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: lab.level === 'EASY' ? 'var(--success-glow)' : lab.level === 'MEDIUM' ? 'var(--warning-glow)' : 'var(--danger-glow)',
                    }}>
                      {lab.level}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{lab.module.split(':')[0]}</span>
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: isActive ? '#fff' : 'var(--text-primary)', marginTop: '8px', display: 'flex', alignItems: 'center', width: '100%' }}>
                    {lab.title.split(': ')[1]}
                    <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: isActive ? 1 : 0, transition: 'var(--transition-smooth)' }} />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Sidebar */}
        <div style={{ padding: '16px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Activity size={12} color="var(--success-glow)" />
            <span>Workspace: <strong>workspace-terminal</strong></span>
          </div>
        </div>
      </div>

      {/* 2. VÙNG HIỂN THỊ TÀI LIỆU HƯỚNG DẪN (GIỮA) */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Sub Header & Điều khiển Lab */}
        <div className="glass-panel" style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--primary-glow)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {activeLab?.module}
            </span>
            <h2 style={{ fontSize: '1.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, marginTop: '2px' }}>
              {activeLab?.title}
            </h2>
          </div>

          {/* Docker Environment Controls */}
          {activeLab?.composePath && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem' }}>
                <span style={{
                  display: 'inline-block',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: dockerStatus === 'RUNNING' ? 'var(--success-glow)' : dockerStatus === 'LOADING' ? 'var(--warning-glow)' : 'var(--danger-glow)',
                  boxShadow: dockerStatus === 'RUNNING' ? '0 0 8px var(--success-glow)' : 'none'
                }} />
                <span style={{ color: 'var(--text-muted)' }}>
                  Môi trường: <strong style={{ color: '#fff' }}>{dockerStatus}</strong>
                </span>
              </div>

              {dockerStatus === 'STOPPED' && (
                <button
                  onClick={startLab}
                  disabled={actionLoading}
                  className="glow-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'var(--success-glow)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <Play size={14} fill="#fff" />
                  Kích hoạt Lab
                </button>
              )}

              {dockerStatus === 'RUNNING' && (
                <button
                  onClick={stopLab}
                  disabled={actionLoading}
                  className="glow-hover"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    background: 'var(--danger-glow)',
                    color: '#fff',
                    border: 'none',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.3)'
                  }}
                >
                  <Square size={14} fill="#fff" />
                  Dừng Lab
                </button>
              )}

              {dockerStatus === 'LOADING' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <RefreshCw size={14} className="animate-spin" />
                  Đang xử lý...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Khu vực Markdown Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px', background: 'rgba(0,0,0,0.1)' }}>
          {loading ? (
            <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Đang tải nội dung...
            </div>
          ) : (
            <div className="markdown-body" dangerouslySetInnerHTML={{ __html: labContent }} />
          )}
        </div>
      </div>

      {/* 3. KHU VỰC THỰC HÀNH TƯƠNG TÁC (PHẢI) */}
      <div style={{ width: '45%', display: 'flex', flexDirection: 'column', height: '100%', background: '#05070f' }}>
        {/* Tabs Control */}
        <div className="glass-panel" style={{ padding: '8px 16px', display: 'flex', gap: '8px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setRightTab('terminal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              borderRadius: '6px',
              background: rightTab === 'terminal' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
              border: 'none',
              color: rightTab === 'terminal' ? 'var(--primary-glow)' : 'var(--text-muted)',
              borderBottom: rightTab === 'terminal' ? '2px solid var(--primary-glow)' : 'none',
              fontWeight: 600,
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <TerminalSquare size={14} />
            Terminal Thực Hành
          </button>

          {activeLab?.guiPort && dockerStatus === 'RUNNING' && (
            <button
              onClick={() => setRightTab('gui')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '6px',
                background: rightTab === 'gui' ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
                border: 'none',
                color: rightTab === 'gui' ? 'var(--accent-neon)' : 'var(--text-muted)',
                borderBottom: rightTab === 'gui' ? '2px solid var(--accent-neon)' : 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <ExternalLink size={14} />
              Giao Diện Dịch Vụ (GUI)
            </button>
          )}
        </div>

        {/* Tab Content Display */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          {/* TAB 1: TERMINAL EMULATOR */}
          <div 
            style={{ 
              display: rightTab === 'terminal' ? 'block' : 'none',
              height: '100%',
              padding: '8px'
            }}
          >
            <div ref={terminalRef} className="terminal-wrapper" />
          </div>

          {/* TAB 2: PORTAL IFRAME (CHỈ HIỂN THỊ KHI LAB CHẠY & CÓ GUI PORT) */}
          {activeLab?.guiPort && dockerStatus === 'RUNNING' && (
            <div 
              style={{ 
                display: rightTab === 'gui' ? 'block' : 'none',
                height: '100%',
                width: '100%',
                background: '#fff'
              }}
            >
              <iframe
                src={`http://localhost:${activeLab.guiPort}`}
                title="Lab Application Interface"
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
