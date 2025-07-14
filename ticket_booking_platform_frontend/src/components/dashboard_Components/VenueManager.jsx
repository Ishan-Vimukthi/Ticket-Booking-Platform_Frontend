import React, { useState, useEffect } from "react";
import axios from "axios";

const VenueManager = () => {
  const [venues, setVenues] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    layoutType: "auditorium",
    rows: 10,
    cols: 10,
    aisleAfterCol: 5,
    categories: [
      { name: "VVIP", color: "#FFC107", rowCount: 2 },
      { name: "VIP", color: "#2196F3", rowCount: 3 },
      { name: "General", color: "#4CAF50", rowCount: 5 },
    ],
    unavailableSeats: [],
  });
  const [svgPreview, setSvgPreview] = useState("");
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentVenueId, setCurrentVenueId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get("/api/venues");
      setVenues(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreview = async () => {
    try {
      const res = await axios.post("/api/venues/preview", {
        rows: formData.rows,
        cols: formData.cols,
        aisleAfterCol: formData.aisleAfterCol,
        categories: formData.categories,
        unavailableSeats: formData.unavailableSeats,
      });
      setSvgPreview(res.data.svg);
    } catch (err) {
      console.error("Error generating preview:", err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index][field] =
      field === "rowCount" ? parseInt(value) : value;
    setFormData({ ...formData, categories: updatedCategories });
  };

  const addCategory = () => {
    setFormData({
      ...formData,
      categories: [
        ...formData.categories,
        { name: "General", color: "#cccccc", rowCount: 1 },
      ],
    });
  };

  const removeCategory = (index) => {
    const updatedCategories = formData.categories.filter((_, i) => i !== index);
    setFormData({ ...formData, categories: updatedCategories });
  };

  const handleSeatClick = (e) => {
    if (e.target.classList.contains("seat")) {
      const seatId = e.target.closest(".seat-group").getAttribute("data-seat");
      setSelectedSeats((prev) => {
        const newSelection = prev.includes(seatId)
          ? prev.filter((id) => id !== seatId)
          : [...prev, seatId];

        setFormData({
          ...formData,
          unavailableSeats: newSelection,
        });

        return newSelection;
      });

      // Force preview update
      generatePreview();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        const res = await axios.put(`/api/venues/${currentVenueId}`, {
          unavailableSeats: formData.unavailableSeats,
        });
        setVenues(venues.map((v) => (v._id === currentVenueId ? res.data : v)));
        alert("Venue updated successfully!");
      } else {
        const res = await axios.post("/api/venues", formData);
        setVenues(prevVenues => Array.isArray(prevVenues) ? [...prevVenues, res.data] : [res.data]);
        alert("Venue created successfully!");
      }
      resetForm();
    } catch (err) {
      console.error("Error saving venue:", err);
      alert("Failed to save venue");
    }
  };

  const editVenue = (venue) => {
    setFormData({
      name: venue.name,
      description: venue.description,
      layoutType: venue.layoutType,
      rows: venue.seatMap.rows,
      cols: venue.seatMap.cols,
      aisleAfterCol: venue.seatMap.aisleAfterCol,
      categories: venue.seatMap.categories,
      unavailableSeats: venue.seatMap.unavailableSeats,
    });
    setSvgPreview(venue.svgTemplate);
    setIsEditing(true);
    setCurrentVenueId(venue._id);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      layoutType: "auditorium",
      rows: 10,
      cols: 10,
      aisleAfterCol: 5,
      categories: [
        { name: "VVIP", color: "#FFC107", rowCount: 2 },
        { name: "VIP", color: "#2196F3", rowCount: 3 },
        { name: "General", color: "#4CAF50", rowCount: 5 },
      ],
      unavailableSeats: [],
    });
    setSvgPreview("");
    setSelectedSeats([]);
    setIsEditing(false);
    setCurrentVenueId(null);
  };

  // Function to handle SVG content with proper scoping
  const renderSvgPreview = () => {
    if (!svgPreview) {
      return (
        <div className="h-64 bg-gray-50 rounded-md flex items-center justify-center text-gray-500">
          <p>Generate preview to see the seat map</p>
        </div>
      );
    }

    // Create a new DOM parser to safely modify the SVG
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgPreview, "image/svg+xml");
    const svgElement = svgDoc.querySelector("svg");

    // Add event listeners to handle seat hover
    const seatGroups = svgElement.querySelectorAll(".seat-group");
    seatGroups.forEach(group => {
      const seat = group.querySelector(".seat");
      if (seat) {
        seat.addEventListener("mouseover", (e) => {
          const seatId = group.getAttribute("data-seat");
          const category = seat.getAttribute("data-category");
          console.log(`Hovered seat: ${seatId}, Category: ${category}`);
        });
        seat.addEventListener("mouseout", () => {
          console.log("Mouse left seat");
        });
      }
    });

    // Convert back to string
    const serializer = new XMLSerializer();
    const updatedSvg = serializer.serializeToString(svgElement);

    return (
      <div
        className="border border-gray-200 p-4 rounded-md overflow-auto max-h-[500px]"
        dangerouslySetInnerHTML={{ __html: updatedSvg }}
        onClick={handleSeatClick}
      />
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* <h2 className="text-2xl font-bold mb-6">Venue Management</h2> */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
                disabled={isEditing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
                disabled={isEditing}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rows
                </label>
                <input
                  type="number"
                  name="rows"
                  min="1"
                  value={formData.rows}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columns
                </label>
                <input
                  type="number"
                  name="cols"
                  min="1"
                  value={formData.cols}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                  disabled={isEditing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aisle After Column
                </label>
                <input
                  type="number"
                  name="aisleAfterCol"
                  min="1"
                  max={formData.cols - 1}
                  value={formData.aisleAfterCol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  disabled={isEditing}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Seat Categories</h3>
                {!isEditing && (
                  <button
                    type="button"
                    onClick={addCategory}
                    className="px-2 py-1 bg-gray-200 text-gray-800 text-sm rounded hover:bg-gray-300"
                  >
                    + Add Category
                  </button>
                )}
              </div>

              {formData.categories.map((category, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-md">
                  <div className="grid grid-cols-4 gap-3 mb-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Category
                      </label>
                      <select
                        value={category.name}
                        onChange={(e) =>
                          handleCategoryChange(index, "name", e.target.value)
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                        disabled={isEditing}
                      >
                        <option value="VVIP">VVIP</option>
                        <option value="VIP">VIP</option>
                        <option value="General">General</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Color
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={category.color}
                          onChange={(e) =>
                            handleCategoryChange(index, "color", e.target.value)
                          }
                          className="h-8 w-8 cursor-pointer"
                          disabled={isEditing}
                        />
                        <span className="ml-2 text-xs">{category.color}</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Rows
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={category.rowCount}
                        onChange={(e) =>
                          handleCategoryChange(
                            index,
                            "rowCount",
                            parseInt(e.target.value)
                          )
                        }
                        className="w-full px-2 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                        disabled={isEditing}
                      />
                    </div>

                    <div className="flex items-end">
                      {!isEditing && (
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-4">
              <button
                type="button"
                onClick={generatePreview}
                className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Generate Preview
              </button>

              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {isEditing ? "Update Venue" : "Save Venue"}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Preview Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Seat Map Preview</h3>

          <div className="flex flex-wrap gap-4 mb-4">
            {formData.categories.map((cat, i) => (
              <div key={i} className="flex items-center">
                <span
                  className="w-4 h-4 inline-block mr-1 border border-gray-300"
                  style={{ backgroundColor: cat.color }}
                ></span>
                <span className="text-sm">
                  {cat.name} ({cat.rowCount} rows)
                </span>
              </div>
            ))}
            <div className="flex items-center">
              <span className="w-4 h-4 inline-block mr-1 bg-red-500 border border-gray-300"></span>
              <span className="text-sm">Unavailable</span>
            </div>
          </div>

          {renderSvgPreview()}

          {selectedSeats.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 rounded-md">
              <h4 className="text-sm font-medium mb-1">
                Marked as Unavailable:
              </h4>
              <p className="text-xs text-gray-700 break-all">
                {selectedSeats.join(", ")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Existing Venues Section
      <div className="mt-12">
        <h3 className="text-xl font-medium mb-4">Existing Venues</h3>
        {isLoading ? (
          <div className="col-span-full text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500">Loading venues...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues && venues.length > 0 ? (
              venues.map((venue) => (
                <div key={venue._id} className="bg-white p-4 rounded-lg shadow">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{venue.name}</h4>
                      <p className="text-sm text-gray-600">
                        {venue.layoutType} ({venue.seatMap.rows}x
                        {venue.seatMap.cols})
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Categories:{" "}
                        {venue.seatMap.categories.map((c) => c.name).join(", ")}
                      </p>
                    </div>
                    <button
                      onClick={() => editVenue(venue)}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                  </div>
                  <div
                    className="mt-2 h-32 overflow-hidden border border-gray-200 rounded"
                    dangerouslySetInnerHTML={{ __html: venue.svgTemplate }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                No venues found. Create your first venue above.
              </div>
            )}
          </div>
        )}
      </div> */}
    </div>
  );
};

export default VenueManager;