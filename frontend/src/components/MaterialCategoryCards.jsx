import { useEffect, useState } from "react";
import api from "../services/api";

export default function MaterialCategoryCards({ projectId }) {

    const [categories, setCategories] = useState([]);
    const [totalPaid, setTotalPaid] = useState(0);

    useEffect(() => {

        if (!projectId) return;

        api.get(`/projects/${projectId}/material-category-totals`)
            .then(res => {

                setCategories(res.data.categories || []);
                setTotalPaid(res.data.total_paid || 0);

            })
            .catch(err => {
                console.error('Error loading material category cards:', err);
            });

    }, [projectId]);

    return (

        <div>

            {/* Total Paid Card */}
            <div className="bg-blue-500 text-white rounded-xl p-5 mb-6">

                <h2 className="text-lg font-bold">

                    Total Paid Amount

                </h2>

                <p className="text-3xl font-bold mt-2">

                    {Number(totalPaid).toLocaleString()}

                </p>

            </div>


            {/* Category Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                {categories.map((card, index) => (

                    <div
                        key={index}
                        className="bg-white shadow rounded-xl p-5"
                    >

                        <h2 className="text-lg font-bold">

                            {card.category}

                        </h2>

                        <p className="text-2xl font-semibold mt-2">

                            {Number(card.total).toLocaleString()}

                        </p>

                    </div>

                ))}

            </div>

        </div>

    );
}
