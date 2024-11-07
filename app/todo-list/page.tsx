'use client'

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { TodoList } from '@/components/todo-list';


export default function TodoListPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/');
    }
  }, [router]);

  return (
    <div>
      <TodoList />
    </div>
  );
}
