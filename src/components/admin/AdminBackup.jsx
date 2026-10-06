import React, { useState, useEffect } from 'react';
import { 
  DatabaseBackup, 
  Database, 
  Download, 
  FileJson, 
  FileSpreadsheet, 
  FileCode, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  HardDrive, 
  ShieldCheck, 
  Layers, 
  Eye, 
  X, 
  Search,
  Package,
  Tags,
  ShoppingBag,
  ListOrdered,
  FileText,
  Users,
  MapPin,
  Settings,
  HelpCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Ordered by foreign-key dependency for proper SQL restoration
export const BACKUP_TABLES_CONFIG = [
  { 
    key: 'categories', 
    name: 'หมวดหมู่สินค้า', 
    englishName: 'categories',
    icon: Tags, 
    description: 'ข้อมูลหมวดหมู่สินค้า รูปภาพ และคำอธิบายหมวดหมู่' 
  },
  { 
    key: 'products', 
    name: 'รายการสินค้าและสต็อก', 
    englishName: 'products',
    icon: Package, 
    description: 'ข้อมูลสินค้า ราคา สต็อกคงเหลือ และรูปภาพสินค้า' 
  },
  { 
    key: 'profiles', 
    name: 'ข้อมูลลูกค้าและผู้ใช้', 
    englishName: 'profiles',
    icon: Users, 
    description: 'รายชื่อลูกค้า เบอร์โทรศัพท์ และระดับสิทธิ์ผู้ใช้' 
  },
  { 
    key: 'addresses', 
    name: 'ที่อยู่จัดส่ง', 
    englishName: 'addresses',
    icon: MapPin, 
    description: 'ที่อยู่จัดส่งสินค้า ที่อยู่เปิดบิลของลูกค้าแต่ละราย' 
  },
  { 
    key: 'orders', 
    name: 'คำสั่งซื้อสินค้า', 
    englishName: 'orders',
    icon: ShoppingBag, 
    description: 'ประวัติคำสั่งซื้อ ยอดเงินรวม สถานะคำสั่งซื้อและสลิปโอนเงิน' 
  },
  { 
    key: 'order_items', 
    name: 'รายการสินค้าในออเดอร์', 
    englishName: 'order_items',
    icon: ListOrdered, 
    description: 'รายละเอียดจำนวนและราคาของสินค้าแต่ละชิ้นในคำสั่งซื้อ' 
  },
  { 
    key: 'quotations', 
    name: 'คิวช่าง / ใบเสนอราคา', 
    englishName: 'quotations',
    icon: FileText, 
    description: 'รายการขอใบเสนอราคา คิวจองล้างแอร์ ซ่อมแอร์ และติดตั้งระบบ' 
  },
  { 
    key: 'store_settings', 
    name: 'การตั้งค่าระบบร้านค้า', 
    englishName: 'store_settings',
    icon: Settings, 
    description: 'การตั้งค่าระบบและรหัสผ่านเข้าหลังบ้าน' 
  }
];

// Helper to fetch all rows from a Supabase table with pagination
async function fetchAllTableRows(tableName, onProgress) {
  let allRows = [];
  let from = 0;
  const pageSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) throw error;
    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      if (onProgress) onProgress(allRows.length);
      if (data.length < pageSize) {
        hasMore = false;
      } else {
        from += pageSize;
      }
    } else {
      hasMore = false;
    }
  }
  return allRows;
}

// Format values safely for PostgreSQL SQL Insert
function formatSqlValue(val) {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'number') return val.toString();
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'object') {
    // Array or JSON object
    return `'${JSON.stringify(val).replace(/'/g, "''")}'::jsonb`;
  }
  return `'${String(val).replace(/'/g, "''")}'`;
}

// Generate valid PostgreSQL script
function generateSqlDump(tablesData) {
  const timestamp = new Date().toISOString();
  let sql = `-- ============================================================\n`;
  sql += `-- PK-เครื่องมือช่าง Database Backup Dump\n`;
  sql += `-- Export Date: ${timestamp}\n`;
  sql += `-- Generated automatically by PK Admin Portal\n`;
  sql += `-- Compatible with PostgreSQL & Supabase SQL Editor\n`;
  sql += `-- ============================================================\n\n`;
  sql += `SET check_function_bodies = false;\n\n`;
  sql += `BEGIN;\n\n`;

  for (const tableConfig of BACKUP_TABLES_CONFIG) {
    const tableName = tableConfig.key;
    const rows = tablesData[tableName];

    if (!rows || rows.length === 0) {
      sql += `-- Table: ${tableName} (0 records - skipped)\n\n`;
      continue;
    }

    sql += `-- ------------------------------------------------------------\n`;
    sql += `-- Table: ${tableName} (${rows.length} records)\n`;
    sql += `-- ------------------------------------------------------------\n`;

    const cols = Object.keys(rows[0]);
    const colList = cols.map(c => `"${c}"`).join(', ');

    // Batch insert in chunks of 50 for clean execution
    for (let i = 0; i < rows.length; i += 50) {
      const batch = rows.slice(i, i + 50);
      const valuesList = batch.map(row => {
        const vals = cols.map(c => formatSqlValue(row[c])).join(', ');
        return `  (${vals})`;
      }).join(',\n');

      sql += `INSERT INTO "public"."${tableName}" (${colList}) VALUES\n${valuesList}\nON CONFLICT DO NOTHING;\n\n`;
    }
  }

  sql += `COMMIT;\n`;
  return sql;
}

// Helper to convert rows to UTF-8 CSV with BOM for Thai Excel support
function convertToCSV(rows) {
  if (!rows || rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const csvRows = [];
  
  csvRows.push(headers.map(h => `"${String(h).replace(/"/g, '""')}"`).join(','));

  for (const row of rows) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) return '""';
      if (typeof val === 'object') val = JSON.stringify(val);
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(values.join(','));
  }

  // \uFEFF BOM is essential for Excel to display Thai characters without garbling
  return '\uFEFF' + csvRows.join('\r\n');
}

// Browser download trigger
function triggerDownload(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const AdminBackup = () => {
  const [tableCounts, setTableCounts] = useState({});
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [exportingAll, setExportingAll] = useState(false);
  const [exportProgress, setExportProgress] = useState({ currentTable: '', percent: 0, statusText: '' });
  const [exportingTable, setExportingTable] = useState(null); // specific table key
  const [lastBackup, setLastBackup] = useState(null);
  const [notification, setNotification] = useState(null);

  // Table Preview Modal State
  const [previewModal, setPreviewModal] = useState({
    isOpen: false,
    tableKey: null,
    tableName: '',
    loading: false,
    rows: [],
    searchQuery: ''
  });

  useEffect(() => {
    fetchTableCounts();
    loadLastBackupInfo();
  }, []);

  const loadLastBackupInfo = () => {
    try {
      const saved = localStorage.getItem('pk_last_backup_info');
      if (saved) {
        setLastBackup(JSON.parse(saved));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const recordBackupSuccess = (type, filename, totalRecords) => {
    const info = {
      timestamp: new Date().toISOString(),
      type,
      filename,
      totalRecords
    };
    setLastBackup(info);
    localStorage.setItem('pk_last_backup_info', JSON.stringify(info));
  };

  const fetchTableCounts = async () => {
    setLoadingCounts(true);
    const counts = {};
    for (const table of BACKUP_TABLES_CONFIG) {
      try {
        const { count, error } = await supabase
          .from(table.key)
          .select('*', { count: 'exact', head: true });
        if (!error) {
          counts[table.key] = count || 0;
        } else {
          counts[table.key] = 0;
        }
      } catch (err) {
        counts[table.key] = 0;
      }
    }
    setTableCounts(counts);
    setLoadingCounts(false);
  };

  const totalAllRows = Object.values(tableCounts).reduce((a, b) => a + (b || 0), 0);

  // 1. Full JSON Backup (All Tables)
  const handleDownloadFullJson = async () => {
    setExportingAll(true);
    setNotification(null);
    const backupData = {};
    const summary = {};
    let totalExportedRecords = 0;

    try {
      for (let i = 0; i < BACKUP_TABLES_CONFIG.length; i++) {
        const table = BACKUP_TABLES_CONFIG[i];
        const progressPct = Math.round(((i) / BACKUP_TABLES_CONFIG.length) * 100);
        setExportProgress({
          currentTable: table.name,
          percent: progressPct,
          statusText: `กำลังดึงข้อมูล: ${table.name} (${table.key})...`
        });

        const rows = await fetchAllTableRows(table.key);
        backupData[table.key] = rows;
        summary[table.key] = rows.length;
        totalExportedRecords += rows.length;
      }

      setExportProgress({
        currentTable: 'เสร็จสิ้น',
        percent: 100,
        statusText: 'กำลังจัดรูปแบบและสร้างไฟล์ JSON...'
      });

      const exportPayload = {
        metadata: {
          system: 'PK-เครื่องมือช่าง Database Backup',
          export_date: new Date().toISOString(),
          version: '1.0.0',
          total_tables: BACKUP_TABLES_CONFIG.length,
          total_records: totalExportedRecords,
          tables_summary: summary
        },
        data: backupData
      };

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const filename = `pk_backup_full_${dateStr}_${timeStr}.json`;

      const jsonStr = JSON.stringify(exportPayload, null, 2);
      triggerDownload(jsonStr, filename, 'application/json;charset=utf-8;');
      recordBackupSuccess('JSON (สมบูรณ์)', filename, totalExportedRecords);

      setNotification({
        type: 'success',
        title: 'สำรองข้อมูลสำเร็จ!',
        message: `ดาวน์โหลดไฟล์ ${filename} เรียบร้อยแล้ว (รวม ${totalExportedRecords.toLocaleString()} รายการ)`
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการสำรองข้อมูล',
        message: err.message || 'ไม่สามารถดึงข้อมูลจาก Supabase ได้'
      });
    } finally {
      setExportingAll(false);
      setExportProgress({ currentTable: '', percent: 0, statusText: '' });
    }
  };

  // 2. Full SQL Dump (.sql)
  const handleDownloadSqlDump = async () => {
    setExportingAll(true);
    setNotification(null);
    const tablesData = {};
    let totalExportedRecords = 0;

    try {
      for (let i = 0; i < BACKUP_TABLES_CONFIG.length; i++) {
        const table = BACKUP_TABLES_CONFIG[i];
        const progressPct = Math.round(((i) / BACKUP_TABLES_CONFIG.length) * 100);
        setExportProgress({
          currentTable: table.name,
          percent: progressPct,
          statusText: `กำลังเตรียมข้อมูล SQL: ${table.name} (${table.key})...`
        });

        const rows = await fetchAllTableRows(table.key);
        tablesData[table.key] = rows;
        totalExportedRecords += rows.length;
      }

      setExportProgress({
        currentTable: 'สร้างไฟล์ SQL',
        percent: 100,
        statusText: 'กำลังประกอบคำสั่ง SQL INSERT Statements...'
      });

      const sqlContent = generateSqlDump(tablesData);
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const filename = `pk_backup_sql_${dateStr}_${timeStr}.sql`;

      triggerDownload(sqlContent, filename, 'application/sql;charset=utf-8;');
      recordBackupSuccess('SQL Dump', filename, totalExportedRecords);

      setNotification({
        type: 'success',
        title: 'ดาวน์โหลดไฟล์ SQL สำเร็จ!',
        message: `สร้างไฟล์ ${filename} พร้อมสำหรับรันใน Supabase SQL Editor เรียบร้อยแล้ว`
      });
    } catch (err) {
      console.error(err);
      setNotification({
        type: 'error',
        title: 'เกิดข้อผิดพลาดในการสร้างไฟล์ SQL',
        message: err.message || 'ไม่สามารถสร้างคำสั่ง SQL ได้'
      });
    } finally {
      setExportingAll(false);
      setExportProgress({ currentTable: '', percent: 0, statusText: '' });
    }
  };

  // 3. Export Single Table (JSON or CSV)
  const handleExportSingleTable = async (tableKey, format = 'json') => {
    setExportingTable(`${tableKey}-${format}`);
    try {
      const rows = await fetchAllTableRows(tableKey);
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10);
      const filename = `pk_${tableKey}_${dateStr}.${format}`;

      if (format === 'json') {
        const payload = {
          table: tableKey,
          exported_at: now.toISOString(),
          count: rows.length,
          data: rows
        };
        triggerDownload(JSON.stringify(payload, null, 2), filename, 'application/json;charset=utf-8;');
      } else if (format === 'csv') {
        const csvContent = convertToCSV(rows);
        triggerDownload(csvContent, filename, 'text/csv;charset=utf-8;');
      }

      setNotification({
        type: 'success',
        title: `ส่งออกตาราง ${tableKey} สำเร็จ!`,
        message: `ดาวน์โหลดไฟล์ ${filename} (${rows.length} รายการ) เรียบร้อยแล้ว`
      });
    } catch (err) {
      setNotification({
        type: 'error',
        title: `ส่งออกตาราง ${tableKey} ไม่สำเร็จ`,
        message: err.message
      });
    } finally {
      setExportingTable(null);
    }
  };

  // 4. Open Preview Modal
  const handleOpenPreview = async (table) => {
    setPreviewModal({
      isOpen: true,
      tableKey: table.key,
      tableName: table.name,
      loading: true,
      rows: [],
      searchQuery: ''
    });

    try {
      const { data, error } = await supabase
        .from(table.key)
        .select('*')
        .limit(25);
      if (error) throw error;
      setPreviewModal(prev => ({
        ...prev,
        loading: false,
        rows: data || []
      }));
    } catch (err) {
      setPreviewModal(prev => ({
        ...prev,
        loading: false,
        rows: []
      }));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Title */}
      <div className="bg-gradient-to-r from-dark via-gray-900 to-dark text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-800 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-400 text-xs font-semibold tracking-wide border border-primary-500/30">
              <ShieldCheck size={14} />
              <span>ระบบรักษาความปลอดภัยและการสำรองข้อมูล</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <DatabaseBackup className="text-primary-500" size={32} />
              สำรองฐานข้อมูลทั้งหมด (Database Backup)
            </h1>
            <p className="text-gray-400 text-sm max-w-2xl leading-relaxed">
              ส่งออกและสำรองข้อมูลทั้งหมดในระบบ PK-เครื่องมือช่าง (สินค้า, หมวดหมู่, สต็อก, ลูกค้า, คำสั่งซื้อ, ใบเสนอราคา และการตั้งค่า) 
              เพื่อความปลอดภัย ป้องกันข้อมูลสูญหาย หรือนำไปกู้คืนในฐานข้อมูล Supabase ได้ทันที
            </p>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={handleDownloadFullJson}
              disabled={exportingAll || loadingCounts}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-500 active:scale-[0.98] transition-all shadow-lg shadow-primary-600/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer text-sm sm:text-base"
            >
              {exportingAll ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  <span>กำลังสำรองข้อมูล...</span>
                </>
              ) : (
                <>
                  <FileJson size={20} />
                  <span>สำรองทั้งหมด (JSON)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadSqlDump}
              disabled={exportingAll || loadingCounts}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl font-semibold text-gray-200 bg-gray-800/80 hover:bg-gray-800 hover:text-white border border-gray-700 active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer text-sm sm:text-base"
              title="สร้างคำสั่ง SQL สำหรับนำไปรันใน Supabase SQL Editor"
            >
              <FileCode size={20} className="text-primary-400" />
              <span>ดาวน์โหลด SQL Dump (.sql)</span>
            </button>

            <button
              onClick={fetchTableCounts}
              disabled={loadingCounts || exportingAll}
              title="รีเฟรชจำนวนข้อมูลล่าสุด"
              className="p-3.5 rounded-xl bg-gray-800/60 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-700/60 transition-colors"
            >
              <RefreshCw size={20} className={loadingCounts ? 'animate-spin text-primary-400' : ''} />
            </button>
          </div>
        </div>

        {/* Live Export Progress Bar */}
        {exportingAll && (
          <div className="mt-6 pt-6 border-t border-gray-800">
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-2 text-gray-300">
              <span className="flex items-center gap-2">
                <RefreshCw size={14} className="animate-spin text-primary-500" />
                {exportProgress.statusText}
              </span>
              <span className="text-primary-400 font-bold">{exportProgress.percent}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-primary-500 h-2.5 rounded-full transition-all duration-300 shadow-md shadow-primary-500/50" 
                style={{ width: `${exportProgress.percent}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-start justify-between gap-3 animate-fade-in ${
          notification.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {notification.type === 'success' ? (
              <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
            ) : (
              <AlertCircle className="text-red-600 mt-0.5 flex-shrink-0" size={20} />
            )}
            <div>
              <p className="font-bold text-sm">{notification.title}</p>
              <p className="text-xs mt-0.5 opacity-90">{notification.message}</p>
            </div>
          </div>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Overview Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Card 1: Total Tables */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-orange-50 text-orange-600 p-3.5 rounded-2xl">
            <Layers size={26} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ตารางในระบบ</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {BACKUP_TABLES_CONFIG.length} <span className="text-sm font-normal text-gray-500">ตาราง</span>
            </h3>
          </div>
        </div>

        {/* Card 2: Total Records */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-blue-50 text-blue-600 p-3.5 rounded-2xl">
            <HardDrive size={26} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ข้อมูลทั้งหมดในระบบ</p>
            <h3 className="text-2xl font-bold text-gray-900 mt-0.5">
              {loadingCounts ? (
                <span className="text-sm text-gray-400 animate-pulse">กำลังนับ...</span>
              ) : (
                `${totalAllRows.toLocaleString()} รายการ`
              )}
            </h3>
          </div>
        </div>

        {/* Card 3: Database Status */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-600 p-3.5 rounded-2xl">
            <Database size={26} />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">สถานะฐานข้อมูล</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="font-bold text-gray-900 text-sm">Supabase เชื่อมต่อแล้ว</span>
            </div>
          </div>
        </div>

        {/* Card 4: Last Backup Timestamp */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-purple-50 text-purple-600 p-3.5 rounded-2xl">
            <Clock size={26} />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">สำรองข้อมูลล่าสุด</p>
            <p className="font-bold text-gray-900 text-sm mt-0.5 truncate">
              {lastBackup ? new Date(lastBackup.timestamp).toLocaleDateString('th-TH', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'ยังไม่มีประวัติในเครื่องนี้'}
            </p>
            {lastBackup && (
              <p className="text-[11px] text-gray-500 truncate">{lastBackup.type} ({lastBackup.totalRecords || 0} รายการ)</p>
            )}
          </div>
        </div>
      </div>

      {/* Tables Breakdown Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Database size={20} className="text-primary-500" />
              รายการตารางข้อมูลและตัวเลือกสำรองรายตาราง
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              สามารถเลือกดาวน์โหลดแยกเฉพาะตารางที่ต้องการเป็นไฟล์ JSON หรือ CSV สำหรับเปิดใช้งานใน Excel ได้
            </p>
          </div>
          <div className="text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
            รวม {BACKUP_TABLES_CONFIG.length} ตาราง
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {BACKUP_TABLES_CONFIG.map((table) => {
            const Icon = table.icon;
            const count = tableCounts[table.key];
            const isJsonLoading = exportingTable === `${table.key}-json`;
            const isCsvLoading = exportingTable === `${table.key}-csv`;

            return (
              <div 
                key={table.key} 
                className="p-5 sm:p-6 hover:bg-gray-50/70 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                {/* Table Info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="bg-gray-100 text-gray-700 p-3 rounded-xl mt-0.5">
                    <Icon size={22} className="text-primary-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-base">{table.name}</h3>
                      <code className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        {table.key}
                      </code>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-100">
                        {loadingCounts ? '...' : `${(count ?? 0).toLocaleString()} แถว`}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-500 mt-1">
                      {table.description}
                    </p>
                  </div>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                  <button
                    onClick={() => handleOpenPreview(table)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                    title="ดูตัวอย่างข้อมูลจริงในตารางนี้"
                  >
                    <Eye size={15} />
                    <span>ตัวอย่าง</span>
                  </button>

                  <button
                    onClick={() => handleExportSingleTable(table.key, 'csv')}
                    disabled={isCsvLoading || exportingAll || count === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                    title="ดาวน์โหลดเป็นไฟล์ CSV (เปิดใน Excel ได้ ภาษาไทยไม่เพี้ยน)"
                  >
                    {isCsvLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={15} />
                    )}
                    <span>CSV (Excel)</span>
                  </button>

                  <button
                    onClick={() => handleExportSingleTable(table.key, 'json')}
                    disabled={isJsonLoading || exportingAll || count === 0}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 border border-primary-200 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                    title="ดาวน์โหลดเฉพาะตารางนี้เป็นไฟล์ JSON"
                  >
                    {isJsonLoading ? (
                      <RefreshCw size={14} className="animate-spin" />
                    ) : (
                      <Download size={15} />
                    )}
                    <span>JSON</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Guide & Restoration Instructions */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 space-y-4">
        <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
          <HelpCircle size={22} className="text-primary-500" />
          คำแนะนำการใช้งานไฟล์สำรองข้อมูล (Backup & Restore Guide)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
              <FileJson size={18} className="text-orange-500" />
              <span>1. ไฟล์ JSON สำรองทั้งหมด</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ไฟล์ <code>.json</code> บันทึกโครงสร้างข้อมูลทั้งหมด 8 ตารางอย่างครบถ้วน สามารถนำไปใช้กู้คืน ย้ายระบบ หรือให้นักพัฒนาโปรแกรมนำไปประมวลผลต่อได้ทันที
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
              <FileCode size={18} className="text-blue-500" />
              <span>2. ไฟล์ SQL Dump สำหรับ Supabase</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              ไฟล์ <code>.sql</code> ประกอบด้วยคำสั่ง <code>INSERT INTO</code> ทุกตาราง สามารถนำไปเปิดแล้วกด <b>Run</b> ในเมนู <b>SQL Editor</b> ของ Supabase Dashboard เพื่อนำเข้าข้อมูลกลับมาได้ทันที
            </p>
          </div>

          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-2">
            <div className="flex items-center gap-2 font-bold text-gray-800 text-sm">
              <FileSpreadsheet size={18} className="text-emerald-500" />
              <span>3. ไฟล์ CSV สำหรับเปิดใน Excel</span>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              มีระบบใส่รหัส UTF-8 BOM อัตโนมัติ ทำให้เมื่อดับเบิลคลิกเปิดไฟล์ในโปรแกรม Microsoft Excel ภาษาไทยจะไม่เป็นภาษาต่างดาว ตัวหนังสือแสดงผลถูกต้อง 100%
            </p>
          </div>
        </div>
      </div>

      {/* Table Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-5xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="bg-primary-50 text-primary-600 p-2.5 rounded-xl">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">
                    ตัวอย่างข้อมูลตาราง: {previewModal.tableName}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    ตาราง: {previewModal.tableKey} (แสดงสูงสุด 25 แถวล่าสุด)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewModal({ isOpen: false, tableKey: null, tableName: '', loading: false, rows: [], searchQuery: '' })}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content / Table */}
            <div className="flex-1 overflow-auto p-4 sm:p-6">
              {previewModal.loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <RefreshCw className="animate-spin text-primary-500" size={32} />
                  <p className="text-sm text-gray-500">กำลังโหลดตัวอย่างข้อมูลจาก Supabase...</p>
                </div>
              ) : previewModal.rows.length === 0 ? (
                <div className="text-center py-16 text-gray-400 text-sm">
                  ไม่มีข้อมูลในตารางนี้
                </div>
              ) : (
                <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto max-h-[50vh]">
                    <table className="min-w-full divide-y divide-gray-200 text-xs">
                      <thead className="bg-gray-100/80 sticky top-0 z-10">
                        <tr>
                          {Object.keys(previewModal.rows[0] || {}).map((col) => (
                            <th 
                              key={col} 
                              className="px-3.5 py-2.5 text-left font-bold text-gray-700 tracking-wider whitespace-nowrap bg-gray-100"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {previewModal.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-primary-50/30 transition-colors">
                            {Object.keys(previewModal.rows[0]).map((col) => {
                              const val = row[col];
                              const displayVal = typeof val === 'object' && val !== null 
                                ? JSON.stringify(val) 
                                : String(val ?? '-');
                              return (
                                <td 
                                  key={col} 
                                  className="px-3.5 py-2 text-gray-600 font-mono whitespace-nowrap max-w-xs truncate"
                                  title={displayVal}
                                >
                                  {displayVal}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-2">
              <button
                onClick={() => setPreviewModal({ isOpen: false, tableKey: null, tableName: '', loading: false, rows: [], searchQuery: '' })}
                className="px-5 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBackup;
