import { useState, useEffect } from 'react';

function App() {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ studentId: '', name: '', email: '' });
  const [editingId, setEditingId] = useState(null); 

  // CÂU 63: Gọi lại API GET /api/students để cập nhật danh sách
  const fetchStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      console.error('Lỗi khi tải danh sách:', err);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEditClick = (student) => {
    setEditingId(student._id);
    setFormData({ studentId: student.studentId, name: student.name, email: student.email });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({ studentId: '', name: '', email: '' });
  };

  // CÂU 61: Thực hiện cập nhật sinh viên (PUT)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const res = await fetch(`/api/students/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          alert('Cập nhật sinh viên thành công!');
          handleCancelEdit();
          fetchStudents(); // Cập nhật lại UI (Câu 63)
        }
      } else {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          alert('Thêm sinh viên thành công!');
          setFormData({ studentId: '', name: '', email: '' });
          fetchStudents(); // Cập nhật lại UI (Câu 63)
        }
      }
    } catch (err) {
      console.error('Lỗi gửi dữ liệu:', err);
    }
  };

  // CÂU 62: Thực hiện xóa sinh viên (DELETE)
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) {
      try {
        const res = await fetch(`/api/students/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          alert('Đã xóa sinh viên thành công!');
          fetchStudents(); // Cập nhật lại UI (Câu 63)
        }
      } catch (err) {
        console.error('Lỗi khi xóa:', err);
      }
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', maxWidth: '850px', margin: '0 auto' }}>
      <h2>Quản Lý Sinh Viên MERN</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h3>{editingId ? '✏️ Cập Nhật Thông Tin' : '➕ Thêm Sinh Viên'}</h3>
        <input
          type="text" name="studentId" placeholder="MSSV"
          value={formData.studentId} onChange={handleChange} required
          style={{ padding: '8px', marginRight: '10px', width: '20%' }}
        />
        <input
          type="text" name="name" placeholder="Họ và tên"
          value={formData.name} onChange={handleChange} required
          style={{ padding: '8px', marginRight: '10px', width: '30%' }}
        />
        <input
          type="email" name="email" placeholder="Email"
          value={formData.email} onChange={handleChange} required
          style={{ padding: '8px', marginRight: '10px', width: '30%' }}
        />
        <button type="submit" style={{ padding: '8px 16px', backgroundColor: editingId ? '#28a745' : '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {editingId ? 'Lưu Cập Nhật' : 'Thêm'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancelEdit} style={{ marginLeft: '8px', padding: '8px 12px', cursor: 'pointer' }}>Hủy</button>
        )}
      </form>

      <h3>Danh Sách Sinh Viên</h3>
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>MSSV</th>
            <th>Họ và tên</th>
            <th>Email</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.studentId}</td>
              <td>{student.name}</td>
              <td>{student.email}</td>
              <td>
                <button onClick={() => handleEditClick(student)} style={{ padding: '4px 10px', marginRight: '8px', cursor: 'pointer' }}>Sửa</button>
                <button onClick={() => handleDelete(student._id)} style={{ padding: '4px 10px', backgroundColor: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;