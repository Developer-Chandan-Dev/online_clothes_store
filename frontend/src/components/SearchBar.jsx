import { useContext, useEffect, useState } from 'react'
import { ShopContext } from '../context/ShopContext'
import { FiSearch, FiX } from 'react-icons/fi';
import { useLocation } from 'react-router-dom';

const SearchBar = () => {
    const { search, setSearch, showSearch, setShowSearch } = useContext(ShopContext);
    const [visible, setVisible] = useState(false);
    const location = useLocation();

    useEffect(() => {
        if (location.pathname.includes('collection')) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    }, [location]);
    
    return showSearch && visible ? (
        <div className='border-t border-b bg-gray-50 py-4'>
            <div className='container mx-auto px-4'>
                <div className='flex items-center justify-center max-w-2xl mx-auto relative'>
                    <div className='relative w-full'>
                        <FiSearch className='absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400' />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className='w-full pl-12 pr-10 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            type="text"
                            placeholder='Search for products...'
                        />
                        {search && (
                            <FiX
                                className='absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 cursor-pointer hover:text-gray-600'
                                onClick={() => setSearch('')}
                            />
                        )}
                    </div>
                    <FiX
                        className='ml-3 h-5 w-5 text-gray-500 cursor-pointer hover:text-gray-700'
                        onClick={() => setShowSearch(false)}
                    />
                </div>
                <div className='mt-2 text-sm text-center text-gray-500'>
                    Press Enter to search
                </div>
            </div>
        </div>
    ) : null;
};

export default SearchBar;