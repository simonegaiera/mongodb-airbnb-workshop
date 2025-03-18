import { Heart, Bed, Bath } from 'lucide-react';
import Link from 'next/link';


const ListingTile = ({ sequence, item, index, handleClick, isValidURL, stockImageUrl }) => {

  return (
    <Link href={`/rooms?id=${item._id}`}>
      <div className={"bg-white overflow-hidden motion-preset-fade motion-duration-2000 motion-delay-"+(sequence*50).toString()}>
        <div className="relative">
          <img
            className="w-full h-48 object-cover rounded-xl"
            src={
              item?.images?.picture_url && isValidURL(item.images.picture_url)
                ? item.images.picture_url
                : stockImageUrl
            }
            alt={item.name || 'Stock Image'}
            onError={(e) => {
              const randomNum = Math.floor(Math.random() * 5) + 1;
              e.target.src = `${process.env.BASE_PATH}/propertyImage${randomNum}.jpg`;
              // console.log("Error loading image");
            }}
          />
          <button className="absolute top-3 right-3 p-2 rounded-full bg-transparent">
            <Heart className="w-6 h-6 text-white fill-gray-900/50 hover:scale-110 transition-all" />
          </button>
        </div>

        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2 hover:text-blue-600">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm mb-1">
            <span className="font-bold">${Math.round(item.price.$numberDecimal)}</span> per night
          </p>
          <p className="text-gray-600 text-sm mb-1">
            Property Type: {item.property_type}
          </p>
          <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
            <div className="flex items-center gap-1">
              <Bed className="w-4 h-4" />
              <span>{item.beds}</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="w-4 h-4" />
              <span>{item.bathrooms?.$numberDecimal || item.bathrooms || 1}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ListingTile;