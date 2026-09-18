import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Trash2,
  Eye,
  X,
  Utensils,
  CheckCircle,
  XCircle,
} from "lucide-react";
import api from "../services/api";

interface Food {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  restaurantId: string;
  available: boolean;
}

interface FoodForm {
  name: string;
  description: string;
  price: string;
  category: string;
  restaurantId: string;
  available: boolean;
}

const emptyForm: FoodForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  restaurantId: "",
  available: true,
};

function Foods() {
  const [foods, setFoods] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [availabilityFilter, setAvailabilityFilter] = useState("all");

  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  const [editingFood, setEditingFood] = useState<Food | null>(null);
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  const [form, setForm] = useState<FoodForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // =========================
  // FETCH FOODS
  // =========================

  const fetchFoods = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/api/foods/");

      const data = Array.isArray(response.data)
        ? response.data
        : response.data.foods || response.data.data || [];

      setFoods(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load foods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // =========================
  // FORM HANDLERS
  // =========================

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setForm((prev) => ({
      ...prev,
      available: e.target.checked,
    }));
  };

  // =========================
  // OPEN CREATE FORM
  // =========================

  const openCreateForm = () => {
    setEditingFood(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  // =========================
  // OPEN EDIT FORM
  // =========================

  const openEditForm = (food: Food) => {
    setEditingFood(food);

    setForm({
      name: food.name,
      description: food.description,
      price: String(food.price),
      category: food.category,
      restaurantId: food.restaurantId,
      available: food.available,
    });

    setShowForm(true);
  };

  // =========================
  // CLOSE FORM
  // =========================

  const closeForm = () => {
    if (saving) return;

    setShowForm(false);
    setEditingFood(null);
    setForm(emptyForm);
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.price ||
      !form.category.trim() ||
      !form.restaurantId.trim()
    ) {
      setError("Please fill all required fields.");
      return;
    }

    const price = Number(form.price);

    if (Number.isNaN(price) || price < 0) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const foodData = {
        name: form.name.trim(),
        description: form.description.trim(),
        price,
        category: form.category.trim(),
        restaurantId: form.restaurantId.trim(),
        available: form.available,
      };

      if (editingFood) {
        await api.put(
          `/api/foods/${editingFood._id}`,
          foodData
        );
      } else {
        await api.post("/api/foods/", foodData);
      }

      await fetchFoods();

      closeForm();
    } catch (err) {
      console.error(err);
      setError(
        editingFood
          ? "Failed to update food."
          : "Failed to create food."
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE FOOD
  // =========================

  const handleDelete = async (food: Food) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${food.name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(food._id);
      setError("");

      await api.delete(`/api/foods/${food._id}`);

      setFoods((prev) =>
        prev.filter((item) => item._id !== food._id)
      );

      if (selectedFood?._id === food._id) {
        setSelectedFood(null);
        setShowViewModal(false);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete food.");
    } finally {
      setDeletingId(null);
    }
  };

  // =========================
  // VIEW FOOD
  // =========================

  const openViewModal = (food: Food) => {
    setSelectedFood(food);
    setShowViewModal(true);
  };

  const closeViewModal = () => {
    setSelectedFood(null);
    setShowViewModal(false);
  };

  // =========================
  // FILTER
  // =========================

  const categories = Array.from(
    new Set(foods.map((food) => food.category))
  ).filter(Boolean);

  const filteredFoods = foods.filter((food) => {
  const searchText = search.toLowerCase();

  const foodName = String(food.name ?? "");
  const description = String(food.description ?? "");
  const category = String(food.category ?? "");
  const restaurantId = String(food.restaurantId ?? "");

  const matchesSearch =
    foodName.toLowerCase().includes(searchText) ||
    description.toLowerCase().includes(searchText) ||
    category.toLowerCase().includes(searchText) ||
    restaurantId.toLowerCase().includes(searchText);

  const matchesCategory =
    categoryFilter === "all" ||
    category === categoryFilter;

  const matchesAvailability =
    availabilityFilter === "all" ||
    (availabilityFilter === "available" && food.available) ||
    (availabilityFilter === "unavailable" && !food.available);

  return (
    matchesSearch &&
    matchesCategory &&
    matchesAvailability
  );
});
  // =========================
  // STATS
  // =========================

  const totalFoods = foods.length;

  const availableFoods = foods.filter(
    (food) => food.available
  ).length;

  const unavailableFoods = foods.filter(
    (food) => !food.available
  ).length;

  const categoryCount = categories.length;

  return (
    <div className="foods-page">

      {/* ================= HEADER ================= */}

      <div className="page-header">
        <div>
          <div className="page-title-row">
            <div className="page-title-icon">
              <Utensils size={22} />
            </div>

            <div>
              <h1>Foods</h1>
              <p>
                Manage menu items, prices, categories and availability.
              </p>
            </div>
          </div>
        </div>

        <div className="page-header-actions">
          <button
            className="secondary-action-button"
            onClick={fetchFoods}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>

          <button
            className="primary-action-button"
            onClick={openCreateForm}
          >
            <Plus size={17} />
            Add Food
          </button>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {error && (
        <div className="food-error-message">
          {error}

          <button onClick={() => setError("")}>
            <X size={15} />
          </button>
        </div>
      )}

      {/* ================= STATS ================= */}

      <div className="food-stats-grid">

        <div className="food-stat-card">
          <div className="food-stat-icon">
            <Utensils size={20} />
          </div>

          <div>
            <span>Total Foods</span>
            <strong>{totalFoods}</strong>
          </div>
        </div>

        <div className="food-stat-card">
          <div className="food-stat-icon available">
            <CheckCircle size={20} />
          </div>

          <div>
            <span>Available</span>
            <strong>{availableFoods}</strong>
          </div>
        </div>

        <div className="food-stat-card">
          <div className="food-stat-icon unavailable">
            <XCircle size={20} />
          </div>

          <div>
            <span>Unavailable</span>
            <strong>{unavailableFoods}</strong>
          </div>
        </div>

        <div className="food-stat-card">
          <div className="food-stat-icon category">
            <Utensils size={20} />
          </div>

          <div>
            <span>Categories</span>
            <strong>{categoryCount}</strong>
          </div>
        </div>

      </div>

      {/* ================= TOOLBAR ================= */}

      <div className="food-toolbar">

        <div className="food-search">
          <Search size={17} />

          <input
            type="text"
            placeholder="Search food, category or restaurant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">All Categories</option>

          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          value={availabilityFilter}
          onChange={(e) =>
            setAvailabilityFilter(e.target.value)
          }
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

      </div>

      {/* ================= FOOD LIST ================= */}

      {loading ? (
        <div className="food-loading">
          <RefreshCw className="spin" size={24} />
          <p>Loading foods...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="food-empty">
          <Utensils size={36} />
          <h3>No foods found</h3>
          <p>
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <div className="food-grid">

          {filteredFoods.map((food, index) => (
            <div
              className="food-card"
              key={food._id}
              style={{
                animationDelay: `${index * 0.05}s`,
              }}
            >

              <div className="food-card-top">

                <div className="food-placeholder">
                  <Utensils size={25} />
                </div>

                <span
                  className={`food-availability ${
                    food.available
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {food.available
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              <div className="food-card-content">

                <div className="food-card-heading">
                  <div>
                    <h3>{food.name}</h3>

                    <span className="food-category">
                      {food.category}
                    </span>
                  </div>

                  <strong className="food-price">
                    ₹{food.price.toFixed(2)}
                  </strong>
                </div>

                <p className="food-description">
                  {food.description}
                </p>

                <div className="food-restaurant">
                  <span>Restaurant ID</span>
                  <strong>{food.restaurantId}</strong>
                </div>

              </div>

              <div className="food-card-actions">

                <button
                  className="food-view-button"
                  onClick={() => openViewModal(food)}
                >
                  <Eye size={15} />
                  View
                </button>

                <button
                  className="food-edit-button"
                  onClick={() => openEditForm(food)}
                >
                  <Pencil size={15} />
                  Edit
                </button>

                <button
                  className="food-delete-button"
                  onClick={() => handleDelete(food)}
                  disabled={deletingId === food._id}
                >
                  <Trash2 size={15} />

                  {deletingId === food._id
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ================= CREATE / EDIT MODAL ================= */}

      {showForm && (
        <div
          className="food-modal-overlay"
          onClick={closeForm}
        >
          <div
            className="food-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="food-modal-header">

              <div>
                <h2>
                  {editingFood
                    ? "Edit Food"
                    : "Add New Food"}
                </h2>

                <p>
                  {editingFood
                    ? "Update food information."
                    : "Add a new item to the menu."}
                </p>
              </div>

              <button
                className="food-modal-close"
                onClick={closeForm}
              >
                <X size={19} />
              </button>

            </div>

            <form
              className="food-form"
              onSubmit={handleSubmit}
            >

              <div className="food-form-row">

                <div className="food-form-group">
                  <label>
                    Food Name
                  </label>

                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Paneer Butter Masala"
                    required
                  />
                </div>

                <div className="food-form-group">
                  <label>
                    Category
                  </label>

                  <input
                    name="category"
                    type="text"
                    value={form.category}
                    onChange={handleInputChange}
                    placeholder="e.g. Indian"
                    required
                  />
                </div>

              </div>

              <div className="food-form-group">

                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Enter food description..."
                  rows={4}
                  required
                />

              </div>

              <div className="food-form-row">

                <div className="food-form-group">
                  <label>
                    Price
                  </label>

                  <input
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={handleInputChange}
                    placeholder="250"
                    required
                  />
                </div>

                <div className="food-form-group">
                  <label>
                    Restaurant ID
                  </label>

                  <input
                    name="restaurantId"
                    type="text"
                    value={form.restaurantId}
                    onChange={handleInputChange}
                    placeholder="e.g. RES002"
                    required
                  />
                </div>

              </div>

              <label className="food-availability-toggle">

                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={handleAvailabilityChange}
                />

                <span>
                  Food is currently available
                </span>

              </label>

              <div className="food-form-actions">

                <button
                  type="button"
                  className="food-cancel-button"
                  onClick={closeForm}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="food-save-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingFood
                    ? "Update Food"
                    : "Create Food"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* ================= VIEW MODAL ================= */}

      {showViewModal && selectedFood && (
        <div
          className="food-modal-overlay"
          onClick={closeViewModal}
        >
          <div
            className="food-view-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="food-modal-header">

              <div>
                <h2>{selectedFood.name}</h2>

                <p>
                  Food details
                </p>
              </div>

              <button
                className="food-modal-close"
                onClick={closeViewModal}
              >
                <X size={19} />
              </button>

            </div>

            <div className="food-detail-content">

              <div className="food-detail-icon">
                <Utensils size={32} />
              </div>

              <div className="food-detail-main">

                <div className="food-detail-price">
                  ₹{selectedFood.price.toFixed(2)}
                </div>

                <span
                  className={`food-availability ${
                    selectedFood.available
                      ? "available"
                      : "unavailable"
                  }`}
                >
                  {selectedFood.available
                    ? "Available"
                    : "Unavailable"}
                </span>

              </div>

              <div className="food-detail-section">
                <span>Category</span>
                <strong>
                  {selectedFood.category}
                </strong>
              </div>

              <div className="food-detail-section">
                <span>Restaurant ID</span>
                <strong>
                  {selectedFood.restaurantId}
                </strong>
              </div>

              <div className="food-detail-section">
                <span>Description</span>
                <p>
                  {selectedFood.description}
                </p>
              </div>

              <div className="food-detail-section">
                <span>Food ID</span>
                <strong className="food-id">
                  {selectedFood._id}
                </strong>
              </div>

            </div>

            <div className="food-view-actions">

              <button
                className="food-edit-button"
                onClick={() => {
                  closeViewModal();
                  openEditForm(selectedFood);
                }}
              >
                <Pencil size={15} />
                Edit Food
              </button>

              <button
                className="food-delete-button"
                onClick={() => handleDelete(selectedFood)}
              >
                <Trash2 size={15} />
                Delete Food
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Foods;