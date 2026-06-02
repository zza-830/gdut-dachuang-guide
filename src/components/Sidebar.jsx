// CrewCut-Inspired Sidebar with User Profile
import React, { useState, useRef, useEffect } from 'react';
import { Offcanvas, Nav, Collapse } from 'react-bootstrap';
import { 
  FaHome, FaBook, FaTrophy, FaProjectDiagram, FaLightbulb,
  FaChevronDown, FaChevronRight, FaStar, FaBrain,
  FaUser, FaCog, FaSignOutAlt, FaShieldAlt, FaClipboardCheck
} from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserSettingsModal from './UserSettingsModal';

const API_BASE = '';

const Sidebar = ({ show, onHide }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [openMenus, setOpenMenus] = useState({ guide: location.pathname.startsWith('/guide') });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef(null);

  // 点击外部关闭下拉
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/admin') return location.pathname === '/admin';
    if (path === '/my-projects') {
      return location.pathname === '/my-projects' || location.pathname.startsWith('/project/') || location.pathname.startsWith('/project');
    }
    return location.pathname.startsWith(path);
  };

  const toggleMenu = (menuKey) => {
    setOpenMenus(prev => ({ ...prev, [menuKey]: !prev[menuKey] }));
  };

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleOpenSettings = () => {
    setShowDropdown(false);
    setShowSettings(true);
  };

  const MenuItem = ({ icon, label, isSubmenu = false, isSelected = false }) => {
    const [isHovered, setIsHovered] = useState(false);
    const active = isSelected || isHovered;
    return (
      <div
        style={{
          height: '40px', display: 'flex', alignItems: 'center',
          padding: '12px 16px', marginLeft: isSubmenu ? '32px' : '8px',
          marginRight: '8px', marginBottom: '4px', borderRadius: '8px',
          color: active ? '#ffffff' : '#a6adb4', textDecoration: 'none',
          fontSize: '16px', fontWeight: isSelected ? 'bold' : 'normal',
          backgroundColor: active ? '#1677ff' : 'transparent',
          transition: 'all 0.3s ease', cursor: 'pointer',
          width: 'calc(100% - 16px)',
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {icon && (
          <span style={{ marginRight: '12px', fontSize: '24px', display: 'flex', alignItems: 'center', width: '24px', justifyContent: 'center', color: active ? '#ffffff' : '#a6adb4' }}>
            {icon}
          </span>
        )}
        <span style={{ flex: 1, color: active ? '#ffffff' : '#a6adb4' }}>{label}</span>
      </div>
    );
  };

  const MenuItemWithLink = ({ to, icon, label, isSubmenu = false, onClick }) => {
    const toPath = to.split('?')[0];
    const selected = isSubmenu
      ? (location.pathname === toPath || location.pathname.startsWith(toPath + '/'))
      : isActive(to);
    return (
      <Link to={to} onClick={onClick} style={{ textDecoration: 'none', display: 'block' }}>
        <MenuItem icon={icon} label={label} isSubmenu={isSubmenu} isSelected={selected} />
      </Link>
    );
  };

  const MenuGroup = ({ title, icon, menuKey, children, onClick }) => {
    const isOpen = openMenus[menuKey];
    const hasActiveChild = children.some(child => {
      const childPath = child.to.split('?')[0];
      return location.pathname === childPath || location.pathname.startsWith(childPath + '/');
    });
    const [isHovered, setIsHovered] = useState(false);
    const active = hasActiveChild || isHovered;
    return (
      <div>
        <div
          onClick={() => toggleMenu(menuKey)}
          style={{
            height: '40px', display: 'flex', alignItems: 'center',
            padding: '12px 16px', marginLeft: '8px', marginRight: '8px',
            marginBottom: '4px', borderRadius: '8px',
            color: active ? '#ffffff' : '#a6adb4', fontSize: '16px',
            cursor: 'pointer', backgroundColor: active ? '#1677ff' : 'transparent',
            fontWeight: hasActiveChild ? 'bold' : 'normal',
            transition: 'all 0.3s ease', width: 'calc(100% - 16px)',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {icon && <span style={{ marginRight: '12px', fontSize: '24px', color: active ? '#ffffff' : '#a6adb4' }}>{icon}</span>}
          <span style={{ flex: 1, color: active ? '#ffffff' : '#a6adb4' }}>{title}</span>
          <span style={{ fontSize: '12px', color: active ? '#ffffff' : '#a6adb4' }}>
            {isOpen ? <FaChevronDown /> : <FaChevronRight />}
          </span>
        </div>
        <Collapse in={isOpen}>
          <div>
            {children.map((child, index) => (
              <MenuItemWithLink key={index} to={child.to} label={child.label} isSubmenu={true} onClick={onClick} />
            ))}
          </div>
        </Collapse>
      </div>
    );
  };

  // 用户资料区域
  const UserProfile = () => {
    const [isHovered, setIsHovered] = useState(false);
    const displayName = user?.name || '未登录';
    const displayId = user?.student_id || '';
    const avatarLetter = displayName.charAt(0).toUpperCase();

    return (
      <div ref={dropdownRef} style={{ position: 'relative' }}>
        {/* 下拉菜单 */}
        {showDropdown && (
          <div style={{
            position: 'absolute', bottom: '100%', left: '8px', right: '8px',
            marginBottom: '4px', backgroundColor: '#0a2540', borderRadius: '10px',
            boxShadow: '0 -4px 16px rgba(0,0,0,0.3)', overflow: 'hidden', zIndex: 100,
            border: '1px solid #1a3a5c'
          }}>
            <div
              onClick={handleOpenSettings}
              style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                color: '#a6adb4', cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1677ff'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#a6adb4'; }}
            >
              <FaCog size={16} /> 个人设置
            </div>
            <div style={{ height: '1px', backgroundColor: '#1a3a5c' }} />
            <div
              onClick={handleLogout}
              style={{
                padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px',
                color: '#ff4d4f', cursor: 'pointer', transition: 'all 0.2s',
                fontSize: '14px',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,77,79,0.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <FaSignOutAlt size={16} /> 退出登录
            </div>
          </div>
        )}

        {/* 用户信息行 */}
        <div
          onClick={() => setShowDropdown(!showDropdown)}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '12px 16px', margin: '0 8px', borderRadius: '10px',
            cursor: 'pointer', transition: 'all 0.2s',
            backgroundColor: isHovered || showDropdown ? 'rgba(22, 119, 255, 0.15)' : 'transparent',
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* 头像 */}
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
            background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '16px', fontWeight: 'bold',
            boxShadow: '0 2px 8px rgba(24, 144, 255, 0.3)'
          }}>
            {user?.avatar ? (
              <img src={user.avatar.startsWith('http') ? user.avatar : `${API_BASE}${user.avatar}`} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : avatarLetter}
          </div>
          {/* 名字和学号 */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '600', lineHeight: '1.3', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {displayName}
            </div>
            <div style={{ color: '#6b7b8d', fontSize: '12px', lineHeight: '1.3' }}>
              {displayId}
            </div>
          </div>
          <FaChevronDown size={12} style={{
            color: '#6b7b8d', transition: 'transform 0.2s',
            transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
          }} />
        </div>
      </div>
    );
  };

  const SidebarContent = ({ onClick }) => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand Section */}
      <div style={{
        padding: '16px 8px', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', marginBottom: '8px',
        borderRadius: '24px', backgroundColor: '#000B2F',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px', position: 'relative' }}>
          <FaLightbulb size={24} style={{ color: '#FFFFFF', marginRight: '8px' }} />
          <FaStar size={16} style={{ color: '#FFD700', position: 'absolute', top: '-4px', right: '20px' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#FFFFFF', fontSize: '20px', fontWeight: 'bold', lineHeight: '1.2' }}>GDUT 大创指南</span>
          <span style={{ color: '#a6adb4', fontSize: '12px', marginTop: '2px' }}>创新创业指南</span>
        </div>
      </div>

      <hr style={{ height: '1px', backgroundColor: '#495057', border: 'none', margin: '8px 16px' }} />

      {/* Navigation Menu */}
      <Nav className="flex-column" style={{ flex: 1, padding: '16px 0 8px 0' }}>
        <MenuItemWithLink to="/" icon={<FaHome />} label="首页" onClick={onClick} />
        <MenuItemWithLink to="/my-projects" icon={<FaProjectDiagram />} label="我的项目" onClick={onClick} />
        <MenuGroup title="大创指南" icon={<FaBook />} menuKey="guide" onClick={onClick}
          children={[
            { to: '/guide/process-map', label: '全流程指引' },
            { to: '/guide/preparation', label: '立项准备' },
            { to: '/guide/related-competitions', label: '相关竞赛' }
          ]}
        />
        <MenuItemWithLink to="/competitions" icon={<FaTrophy />} label="竞赛信息" onClick={onClick} />
        <MenuItemWithLink to="/ai-creation" icon={<FaBrain />} label="AI 双创智填" onClick={onClick} />
        {user?.role === 'admin' && (
          <>
            <MenuItemWithLink to="/admin" icon={<FaShieldAlt />} label="后台管理" onClick={onClick} />
            <MenuItemWithLink to="/admin/competition-review" icon={<FaClipboardCheck />} label="赛事时间审核" onClick={onClick} />
          </>
        )}
      </Nav>

      {/* 底部分隔线 + 用户资料 */}
      <hr style={{ height: '1px', backgroundColor: '#495057', border: 'none', margin: '8px 16px 4px' }} />
      <div style={{ paddingBottom: '12px' }}>
        <UserProfile />
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="d-none d-md-block sidebar-scroll"
        style={{
          width: '240px', minHeight: '100vh', position: 'fixed',
          left: 0, top: 0, background: '#001529',
          overflowY: 'auto', overflowX: 'hidden', zIndex: 1020,
          display: 'flex', flexDirection: 'column', padding: '16px 8px'
        }}
      >
        <SidebarContent onClick={() => {}} />
      </div>

      {/* Mobile Offcanvas */}
      <Offcanvas
        show={show} onHide={onHide} placement="start"
        style={{ width: '240px', background: '#001529', color: '#a6adb4' }}
      >
        <Offcanvas.Header closeButton style={{ borderBottom: '1px solid #334454', color: '#a6adb4' }}>
          <Offcanvas.Title style={{ color: '#a6adb4' }}>导航菜单</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="p-0" style={{ display: 'flex', flexDirection: 'column' }}>
          <SidebarContent onClick={onHide} />
        </Offcanvas.Body>
      </Offcanvas>

      {/* 个人设置弹窗 */}
      <UserSettingsModal show={showSettings} onHide={() => setShowSettings(false)} />
    </>
  );
};

export default Sidebar;
