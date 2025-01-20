import { useState, useEffect } from 'react';
import { Home, Coffee, Package, Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Category } from '../types';

interface SidebarProps {
  onCategorySelect: (category: string) => void;
  onManageProducts: () => void;
}

export default function Sidebar({ onCategorySelect, onManageProducts }: SidebarProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name');

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    onCategorySelect(category);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('categories')
        .insert([{
          name: newCategory.trim(),
          user_id: user.id
        }]);

      if (error) throw error;

      setNewCategory('');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('categories')
        .update({ name: category.name })
        .eq('id', category.id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Authentication required');

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', categoryId)
        .eq('user_id', user.id);

      if (error) throw error;

      if (selectedCategory === categoryId) {
        handleCategorySelect('All');
      }
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  };

  return (
    <div className="bg-gray-900 text-white w-64 p-4 flex flex-col h-full">
      <div className="flex items-center space-x-2 mb-8">
        <Package className="h-8 w-8" />
        <h1 className="text-xl font-bold">POS System</h1>
      </div>

      {error && (
        <div className="bg-red-500 text-white p-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      <div className="mb-4">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="text-sm text-blue-400 hover:text-blue-300 flex items-center"
        >
          <Edit2 className="h-4 w-4 mr-1" />
          {isEditing ? 'Done Editing' : 'Edit Categories'}
        </button>
      </div>

      <nav className="space-y-2 flex-1 overflow-y-auto">
        <button
          onClick={() => handleCategorySelect('All')}
          className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
            selectedCategory === 'All'
              ? 'bg-blue-600 text-white'
              : 'hover:bg-gray-800'
          }`}
        >
          <Home className="h-5 w-5" />
          <span>All Products</span>
        </button>

        {categories.map((category) => (
          <div
            key={category.id}
            className={`flex items-center group ${
              isEditing ? 'pr-2' : ''
            }`}
          >
            {isEditing && (
              <button className="p-1 cursor-grab">
                <GripVertical className="h-4 w-4 text-gray-500" />
              </button>
            )}
            
            {editingCategory?.id === category.id ? (
              <div className="flex-1 flex items-center space-x-2">
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({
                    ...editingCategory,
                    name: e.target.value
                  })}
                  className="flex-1 bg-gray-800 text-white rounded px-2 py-1 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleUpdateCategory(editingCategory);
                    }
                  }}
                />
                <button
                  onClick={() => handleUpdateCategory(editingCategory)}
                  className="text-green-500 hover:text-green-400"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleCategorySelect(category.id)}
                className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-800'
                }`}
              >
                <Coffee className="h-5 w-5" />
                <span>{category.name}</span>
              </button>
            )}

            {isEditing && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setEditingCategory(category)}
                  className="p-1 text-blue-400 hover:text-blue-300"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="p-1 text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {isEditing && (
          <div className="mt-4">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="flex-1 bg-gray-800 text-white rounded px-3 py-2 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddCategory();
                  }
                }}
              />
              <button
                onClick={handleAddCategory}
                className="p-2 bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </nav>

      <button
        onClick={onManageProducts}
        className="flex items-center space-x-3 w-full p-3 mt-4 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors"
      >
        <Package className="h-5 w-5" />
        <span>Manage Products</span>
      </button>
    </div>
  );
}