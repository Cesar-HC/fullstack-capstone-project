import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlConfig } from '../../config';
import './SearchPage.css';

function SearchPage() {
    const navigate = useNavigate();

    // Task 1: Initialize state variables for search criteria and results
    const [searchQuery, setSearchQuery] = useState('');
    const [ageRange, setAgeRange] = useState(6); // Initialize with minimum value
    const [searchResults, setSearchResults] = useState([]);

    // Categorías y condiciones definidas para los selectores (dropdowns)
    const categories = ['Living', 'Bedroom', 'Bathroom', 'Kitchen', 'Office'];
    const conditions = ['New', 'Like New', 'Older'];

    // Task 2: Fetch search results based on user inputs
    const handleSearch = async () => {
        const baseUrl = `${urlConfig.backendUrl}/api/search?`;
        // Construct the search URL based on user input
        const queryParams = new URLSearchParams({
            name: searchQuery,
            age_years: ageRange,
            category: document.getElementById('categorySelect').value,
            condition: document.getElementById('conditionSelect').value,
        }).toString();

        try {
            const response = await fetch(`${baseUrl}${queryParams}`);
            if (!response.ok) {
                throw new Error('Search failed');
            }
            const data = await response.json();
            setSearchResults(data);
        } catch (error) {
            console.error('Failed to fetch search results:', error);
        }
    };

    // Task 6: Navigate to the details page when a result is clicked
    const goToDetailsPage = (productId) => {
        navigate(`/app/product/${productId}`);
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-8 col-lg-6">
                    <div className="filter-section bg-light p-4 border rounded shadow-sm">
                        <h4 className="mb-4">Search Gifts</h4>
                        
                        <div className="d-flex flex-column">
                            {/* Task 7: Add text input field for search criteria */}
                            <div className="mb-3">
                                <label htmlFor="searchQuery" className="form-label">Search Query</label>
                                <input
                                    type="text"
                                    id="searchQuery"
                                    className="form-control"
                                    placeholder="Enter gift name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Task 3: Dynamically generate category dropdown */}
                            <div className="mb-3">
                                <label htmlFor="categorySelect" className="form-label">Category</label>
                                <select id="categorySelect" className="form-control">
                                    <option value="">All</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Task 3: Dynamically generate condition dropdown */}
                            <div className="mb-3">
                                <label htmlFor="conditionSelect" className="form-label">Condition</label>
                                <select id="conditionSelect" className="form-control">
                                    <option value="">All</option>
                                    {conditions.map(condition => (
                                        <option key={condition} value={condition}>{condition}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Task 4: Implement age range slider */}
                            <div className="mb-4">
                                <label htmlFor="ageRange" className="form-label">
                                    Less than {ageRange} years
                                </label>
                                <input
                                    type="range"
                                    className="form-control-range w-100"
                                    id="ageRange"
                                    min="1"
                                    max="10"
                                    value={ageRange}
                                    onChange={e => setAgeRange(e.target.value)}
                                />
                            </div>

                            {/* Task 8: Implement search button */}
                            <button className="btn btn-primary w-100" onClick={handleSearch}>
                                Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Task 5: Display fetched search results */}
            <div className="search-results mt-5">
                {searchResults.length > 0 ? (
                    <div className="row">
                        {searchResults.map(product => (
                            <div key={product.id} className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    {/* Check if product has an image and display it */}
                                    {product.image ? (
                                        <img src={product.image} alt={product.name} className="card-img-top" style={{height: "200px", objectFit: "cover"}} />
                                    ) : (
                                        <div className="bg-secondary text-white d-flex justify-content-center align-items-center" style={{height: "200px"}}>
                                            No Image Available
                                        </div>
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{product.name}</h5>
                                        <p className="card-text text-muted">
                                            {product.description ? product.description.slice(0, 80) + '...' : 'No description available'}
                                        </p>
                                        <div className="mt-auto text-center">
                                            <button onClick={() => goToDetailsPage(product.id)} className="btn btn-outline-primary w-100">
                                                View More
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="alert alert-info text-center" role="alert">
                        No products found. Please revise your filters.
                    </div>
                )}
            </div>
        </div>
    );
}

export default SearchPage;