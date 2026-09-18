import { useMemo, useState } from "react";
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  ThumbsUp,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

interface FeedbackItem {
  id: number;
  customer: string;
  message: string;
  rating: number;
  category: string;
  status: "Positive" | "Needs Attention";
  date: string;
}

const feedbackData: FeedbackItem[] = [
  {
    id: 1,
    customer: "Customer 1",
    message: "Food was delicious and service was quick.",
    rating: 5,
    category: "Food Quality",
    status: "Positive",
    date: "Today",
  },
  {
    id: 2,
    customer: "Customer 2",
    message: "The food was good but service was a little slow.",
    rating: 3,
    category: "Service",
    status: "Needs Attention",
    date: "Yesterday",
  },
  {
    id: 3,
    customer: "Customer 3",
    message: "Very good experience. Would order again.",
    rating: 5,
    category: "Overall",
    status: "Positive",
    date: "Yesterday",
  },
  {
    id: 4,
    customer: "Customer 4",
    message: "Food temperature could be improved.",
    rating: 3,
    category: "Food Temperature",
    status: "Needs Attention",
    date: "2 days ago",
  },
];

function Feedback() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filteredFeedback = useMemo(() => {
    return feedbackData.filter((item) => {
      const matchesSearch =
        item.customer
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.message
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        item.category
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || item.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  const positiveCount = feedbackData.filter(
    (item) => item.status === "Positive"
  ).length;

  const attentionCount = feedbackData.filter(
    (item) => item.status === "Needs Attention"
  ).length;

  const averageRating =
    feedbackData.reduce(
      (sum, item) => sum + item.rating,
      0
    ) / feedbackData.length;

  return (
    <div className="feedback-page">

      {/* Header */}
      <div className="feedback-header">
        <div>
          <span className="feedback-eyebrow">
            CUSTOMER EXPERIENCE
          </span>

          <h1>Feedback</h1>

          <p>
            Monitor customer feedback and understand
            customer satisfaction.
          </p>
        </div>
      </div>

      {/* Statistics */}
      <div className="feedback-stats">

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon">
            <MessageSquare size={23} />
          </div>

          <div>
            <span>Total Feedback</span>
            <strong>{feedbackData.length}</strong>
            <small>Customer responses</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-star-icon">
            <Star size={23} />
          </div>

          <div>
            <span>Average Rating</span>
            <strong>{averageRating.toFixed(1)}</strong>
            <small>Out of 5.0</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-positive-icon">
            <ThumbsUp size={23} />
          </div>

          <div>
            <span>Positive</span>
            <strong>{positiveCount}</strong>
            <small>Positive responses</small>
          </div>
        </div>

        <div className="feedback-stat-card">
          <div className="feedback-stat-icon feedback-warning-icon">
            <AlertTriangle size={23} />
          </div>

          <div>
            <span>Needs Attention</span>
            <strong>{attentionCount}</strong>
            <small>Requires review</small>
          </div>
        </div>

      </div>

      {/* Feedback List */}
      <div className="feedback-main-card">

        <div className="feedback-card-header">
          <div>
            <h2>Customer Feedback</h2>
            <p>
              Review recent customer experiences
            </p>
          </div>

          <MessageSquare size={24} />
        </div>

        {/* Search and Filter */}
        <div className="feedback-controls">

          <div className="feedback-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Search feedback..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="feedback-filter">
            <Filter size={17} />

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
            >
              <option value="All">All Feedback</option>
              <option value="Positive">Positive</option>
              <option value="Needs Attention">
                Needs Attention
              </option>
            </select>
          </div>

        </div>

        {/* List */}
        <div className="feedback-list">

          {filteredFeedback.length > 0 ? (
            filteredFeedback.map((item) => (
              <div
                className="feedback-item"
                key={item.id}
              >

                <div className="feedback-avatar">
                  {item.customer.charAt(
                    item.customer.length - 1
                  )}
                </div>

                <div className="feedback-content">

                  <div className="feedback-item-top">

                    <div>
                      <h3>{item.customer}</h3>

                      <span className="feedback-date">
                        {item.date}
                      </span>
                    </div>

                    <div className="feedback-rating">
                      {[1, 2, 3, 4, 5].map(
                        (star) => (
                          <Star
                            key={star}
                            size={15}
                            fill={
                              star <= item.rating
                                ? "currentColor"
                                : "none"
                            }
                          />
                        )
                      )}
                    </div>

                  </div>

                  <p>{item.message}</p>

                  <div className="feedback-item-bottom">

                    <span className="feedback-category">
                      {item.category}
                    </span>

                    <span
                      className={`feedback-status ${
                        item.status === "Positive"
                          ? "feedback-status-positive"
                          : "feedback-status-warning"
                      }`}
                    >
                      {item.status === "Positive" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <AlertTriangle size={14} />
                      )}

                      {item.status}
                    </span>

                  </div>

                </div>

              </div>
            ))
          ) : (
            <div className="feedback-no-results">
              <Search size={32} />
              <h3>No feedback found</h3>
              <p>
                Try changing your search or filter.
              </p>
            </div>
          )}

        </div>

      </div>

      {/* Backend Notice */}
      <div className="feedback-info">
        <MessageSquare size={19} />

        <p>
          Feedback is currently displayed as sample
          interface data. Your current backend Swagger
          does not expose a Feedback endpoint yet.
        </p>
      </div>

    </div>
  );
}

export default Feedback;