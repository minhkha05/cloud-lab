import { useState, useEffect } from 'react';

function App() {
  // Câu 47: State lưu trữ danh sách sinh viên
  const [students, setStudents] = useState([]);

  // Câu 48: State quản lý Form nhập liệu MSSV, Họ tên, Email
  const [formData, setFormData] = useState({
    studentId: '',
    name: '',
    email: ''
  });

  // Câu 47: Hàm gọi API GET /api/students
  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        console.error('Không thể lấy danh sách sinh viên');
      }
    } catch (error) {
      console.error('Lỗi khi gọi API GET:', error);
    }
  };

  // Tự động tải danh sách khi giao diện khởi chạy
  useEffect(() => {
    fetchStudents();
  }, []);

  // Xử lý cập nhật State khi nhập liệu vào input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Câu 49: Gửi dữ liệu từ Form đến API POST /api/students
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Thêm sinh viên thành công!');
        fetchStudents(); // Cập nhật lại danh sách hiển thị
        setFormData({ studentId: '', name: '', email: '' }); // Xóa trắng form
      } else {
        const errorData = await response.json();
        alert('Lỗi: ' + (errorData.message || errorData.error));
      }
    } catch (error) {
      console.error('Lỗi khi gọi API POST:', error);
    }
  };

  return (
    <div style={{ padding: '24px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Ứng Dụng Quản Lý Sinh Viên MERN</h2>

      {/* Câu 48: Form nhập MSSV, Họ tên và Email */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '24px', padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h3>Thêm Sinh Viên Mới</h3>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="studentId"
            placeholder="MSSV (VD: 235186)"
            value={formData.studentId}
            onChange={handleChange}
            required
            style={{ padding: '8px', width: '95%', marginBottom: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            name="name"
            placeholder="Họ và tên"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ padding: '8px', width: '95%', marginBottom: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ padding: '8px', width: '95%', marginBottom: '8px' }}
          />
        </div>
        <button type="submit" style={{ padding: '8px 20px', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Thêm Sinh Viên
        </button>
      </form>

      {/* Câu 47: Bảng hiển thị danh sách sinh viên */}
      <h3>Danh Sách Sinh Viên</h3>
      <table border="1" cellPadding="10" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th>MSSV</th>
            <th>Họ và tên</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((item) => (
              <tr key={item._id}>
                <td>{item.studentId}</td>
                <td>{item.name}</td>
                <td>{item.email}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: 'center' }}>Không có dữ liệu sinh viên</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default App;