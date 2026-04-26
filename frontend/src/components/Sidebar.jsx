import { useState, useEffect } from "react";
import { Sidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import { Link, useLocation } from "react-router-dom";
import api from "../services/api";
import logo from "../assets/logo.svg";

import {
  LayoutDashboard,
  Users,
  Folder,
  HardHat,
  Receipt,
  Boxes,
  DollarSign,
  Wallet,
  Building2,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Package,
  TrendingUp,
  ChevronDown,
  Settings,
  FileText,
  UserCheck,
  Archive,
  User,
  Briefcase,
} from "lucide-react";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const location = useLocation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/material-categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <Sidebar
        collapsed={collapsed}
        backgroundColor="#0f172a"
        rootStyles={{
          height: "100vh",
          color: "#ffffff",
          borderRight: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Header */}
        <div
  style={{
    padding: "15px",
    fontSize: 16,
    fontWeight: "bold",
    display: "flex",
    justifyContent: collapsed ? "center" : "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#ffffff",
    backgroundColor: "#0f172a",
  }}
>
  {/* LEFT SIDE: LOGO + TEXT */}
  {!collapsed && (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={logo}
        alt="logo"
        style={{ width: 68, height: 68 }}
      />
      <span>Construction</span>
    </div>
  )}

  {collapsed && (
    <img
      src={logo}
      alt="logo"
      style={{ width: 78, height: 78 }}
    />
  )}

  <button
    onClick={() => setCollapsed(!collapsed)}
    style={{
      background: "transparent",
      border: "none",
      color: "#ffffff",
      cursor: "pointer",
      padding: "5px",
      borderRadius: "4px",
    }}
  >
    {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
  </button>
</div>

        <Menu
          menuItemStyles={{
            button: ({ active }) => ({
              color: "#e2e8f0",
              padding: "12px 16px",
              backgroundColor: active ? "rgba(255,255,255,0.1)" : "transparent",
              borderRadius: "8px",
              margin: "4px 8px",
              transition: "all 0.2s ease",
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.08)",
                color: "#ffffff",
              },
            }),
            subMenuContent: {
              backgroundColor: "#3d64beff",
              color: "#e2e8f0",
            },
          }}
        >
          <MenuItem 
            icon={<LayoutDashboard size={18} />} 
            component={<Link to="/" />}
            active={location.pathname === "/"}
          >
            Dashboard
          </MenuItem>
          
          <SubMenu 
            icon={<HardHat size={18} />} 
            label="Worker"
            labelStyles={{ color: "#ffffffff", fontWeight: 500 }}
          >
            <MenuItem 
              icon={<Users size={16} />} 
              component={<Link to="/workers" />}
              active={location.pathname === "/workers"}
            >
              Worker List
            </MenuItem>
            <MenuItem 
              icon={<Wallet size={16} />} 
              component={<Link to="/worker-payments" />}
              active={location.pathname === "/worker-payments"}
            >
              Worker Payments
            </MenuItem>
          </SubMenu>

          <MenuItem 
            icon={<Receipt size={18} />} 
            component={<Link to="/expenses" />}
            active={location.pathname === "/expenses"}
          >
            Expenses
          </MenuItem>

          <MenuItem 
            icon={<FileText size={18} />} 
            component={<Link to="/bills" />}
            active={location.pathname === "/bills"}
          >
            Bills
          </MenuItem>

          <MenuItem 
            icon={<UserCheck size={18} />} 
            component={<Link to="/employees" />}
            active={location.pathname === "/employees"}
          >
            Employees
          </MenuItem>

          <MenuItem 
            icon={<Archive size={18} />} 
            component={<Link to="/document-bank" />}
            active={location.pathname === "/document-bank"}
          >
            Document Bank
          </MenuItem>

          <SubMenu 
            icon={<Boxes size={18} />} 
            label="Materials"
            labelStyles={{ color: "#e2e8f0", fontWeight: 500 }}
          >
            <MenuItem 
              icon={<Package size={16} />} 
              component={<Link to="/material-categories" />}
              active={location.pathname === "/material-categories"}
            >
              Materials Dashboard
            </MenuItem>
            
            {/* Categories SubMenu inside Materials */}
            <SubMenu 
              icon={<Folder size={16} />} 
              label="Categories"
              labelStyles={{ color: "#e2e8f0", fontWeight: 500 }}
            >
              {!loadingCategories && categories.map((category) => (
                <MenuItem
                  key={category.id}
                  icon={<Package size={14} />}
                  component={<Link to={`/category/${category.id}`} />}
                  active={location.pathname === `/category/${category.id}`}
                >
                  {category.name}
                </MenuItem>
              ))}
              {loadingCategories && (
                <MenuItem icon={<Package size={14} />}>
                  Loading...
                </MenuItem>
              )}
            </SubMenu>
          </SubMenu>
          
          <SubMenu 
            icon={<Wallet size={18} />} 
            label="Balance"
            labelStyles={{ color: "#e2e8f0", fontWeight: 500 }}
          >
            <MenuItem 
              icon={<Users size={16} />} 
              component={<Link to="/parties" />}
              active={location.pathname === "/parties"}
            >
              Parties
            </MenuItem>
          </SubMenu>
          
          <SubMenu 
            icon={<Package size={18} />} 
            label="Units"
            labelStyles={{ color: "#e2e8f0", fontWeight: 500 }}
          >
            <MenuItem 
              icon={<Building2 size={16} />} 
              component={<Link to="/units" />}
              active={location.pathname === "/units"}
            >
              Units
            </MenuItem>
            <MenuItem 
              icon={<ShoppingCart size={16} />} 
              component={<Link to="/sell-unit" />}
              active={location.pathname === "/sell-unit"}
            >
              Sell Unit
            </MenuItem>
            <MenuItem 
              icon={<Settings size={16} />} 
              component={<Link to="/unit-settings" />}
              active={location.pathname === "/unit-settings"}
            >
              Unit Settings
            </MenuItem>
          </SubMenu>

          <SubMenu 
            icon={<Settings size={18} />} 
            label="Settings"
            labelStyles={{ color: "#e2e8f0", fontWeight: 500 }}
          >
            <MenuItem 
              icon={<User size={16} />} 
              component={<Link to="/profile" />}
              active={location.pathname === "/profile"}
            >
              Profile
            </MenuItem>
            <MenuItem 
              icon={<Briefcase size={16} />} 
              component={<Link to="/projects" />}
              active={location.pathname === "/projects"}
            >
              Projects
            </MenuItem>
          </SubMenu>
        </Menu>
      </Sidebar>
    </div>
  );
}