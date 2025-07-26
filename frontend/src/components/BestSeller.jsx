import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import Title from './Title';
import ProductItem from './ProductItem';
import { Loader2 } from 'lucide-react';

const BestSeller = () => {
    const { products } = useContext(ShopContext);
    const [bestSeller, setBestSeller] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        
        // Simulate loading delay for demonstration
        const timer = setTimeout(() => {
            const bestProducts = products.filter((item) => item.bestseller);
            setBestSeller(bestProducts.slice(0, 5));
            setIsLoading(false);
        }, 800); // 800ms delay to show loading state
        
        return () => clearTimeout(timer);
    }, [products]);

    return (
        <div className='my-10'>
            <div className='text-center text-3xl py-8'>
                <Title text1={'BEST'} text2={'SELLERS'}/>
                <p className='w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600'>
                    Discover the Trendsetters of Today
                </p>
            </div>

            {/* Loading and Products Rendering */}
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-gray-500 mx-auto" />
                        <p className="mt-4 text-gray-600">Loading best sellers...</p>
                    </div>
                </div>
            ) : (
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6'>
                    {bestSeller.length > 0 ? (
                        bestSeller.map((item, index) => (
                            <ProductItem 
                                key={index} 
                                id={item._id} 
                                name={item.name} 
                                image={item.image} 
                                price={item.price} 
                            />
                        ))
                    ) : (
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No best sellers found
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default BestSeller;