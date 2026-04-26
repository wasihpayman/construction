import { useEffect, useState } from "react";
import api from "../services/api";

export default function CategoryCards({ projectId }) {

    const [cards, setCards] = useState([]);

    useEffect(() => {

        if (!projectId) return;

        api.get(`/projects/${projectId}/category-cards`)
            .then(res => {
                setCards(res.data);
            })
            .catch(err => {
                console.error('Error loading category cards:', err);
            });

    }, [projectId]);

    return (

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {cards.map((card, index) => (

                <div
                    key={index}
                    className="bg-white shadow rounded-xl p-5"
                >

                    <h2 className="text-lg font-bold">
                        {card.category}
                    </h2>

                    <p className="text-2xl font-semibold mt-2">

                        {Number(card.total).toLocaleString()}
                        {" "}
                        {card.currency}

                    </p>

                </div>

            ))}

        </div>

    );
}
