import { useState } from "react";

function App() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: ""
    });

    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setLoading(true);
        setResponse(null);

        try {
            const res = await fetch("/api/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }

            setResponse({
                success: true,
                message: data.message
            });

            setFormData({
                name: "",
                email: "",
                message: ""
            });

        } catch (error) {
            setResponse({
                success: false,
                message: error.message
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <div className="form-card">

                <h1>Contact Form</h1>

                <p className="subtitle">
                    React + Express + Flask + Docker
                </p>

                <form onSubmit={handleSubmit}>

                    <label>Name</label>
                    <input
                        type="text"
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />

                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <label>Message</label>
                    <textarea
                        name="message"
                        placeholder="Enter your message"
                        value={formData.message}
                        onChange={handleChange}
                        rows="4"
                        required
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </button>

                </form>

                {response && (
                    <div className={
                        response.success ? "success" : "error"
                    }>
                        {response.message}
                    </div>
                )}

            </div>
        </div>
    );
}

export default App;