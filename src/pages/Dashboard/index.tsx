import { Header } from '../../components/Header';
import api from '../../services/api';
import { Food } from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';
import { useEffect, useState } from 'react';

interface FoodProps {
  id: number
  name: string
  description: string
  price: string
  available: boolean
  image: string
}

export function Dashboard() {
  const [editingFood, setEditingFood] = useState({} as FoodProps);
  const [foods, setFoods] = useState([] as FoodProps[]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      await api.get('/foods').then(response => setFoods(response.data));
    })();
  }, []);

  async function handleAddFood(food: FoodProps) {
    try {
      await api.post('/foods', {
        ...food,
        available: true
      }).then(response => setFoods(oldFoods => ([...oldFoods, response.data])))
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(food: FoodProps) {
    try {
      await api.put(`/foods/${editingFood.id}`, { ...editingFood, ...food })
        .then(response => {
          const foodsUpdated = foods.map(f => 
            f.id !== response.data.id ? f : response.data
          );

          setFoods(foodsUpdated);
        })
    } catch (err) {
      console.log(err);
    }
  }

  async function handleDeleteFood(id: number) {
    await api.delete(`/foods/${id}`);

    const foodsFiltered = foods.filter(food => food.id !== id);

    setFoods(foodsFiltered);
  }

  function handleEditFood(food: FoodProps) {
    setEditingFood(food);
    setEditModalOpen(true);
  }

  function toggleModal() {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal() {
    setEditModalOpen(!editModalOpen);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
}