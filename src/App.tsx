import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Calendar from '@/pages/Calendar';
import Notes from '@/pages/Notes';
import Progress from '@/pages/Progress';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/notes" element={<Notes />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
