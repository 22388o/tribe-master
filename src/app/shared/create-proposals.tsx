'use client';

import { useState } from 'react';
import Button from '@/components/ui/button';
import Input from '@/components/ui/forms/input';
import Textarea from '@/components/ui/forms/textarea';
import { Plus } from '@/components/icons/plus';
import { Minus } from '@/components/icons/minus';

const CreateProposalPage = () => {
  const [inputs, setInputs] = useState(['']);
  const handleAddInput = () => {
    setInputs([...inputs, '']);
  };

  const handleRemoveInput = () => {
    if (inputs.length > 1) {
      setInputs(inputs.slice(0, -1));
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1160px] text-sm">
      <h2 className="mb-5 text-lg font-medium dark:text-gray-100 sm:mb-6 lg:mb-7 xl:text-xl">
        Create a new proposal
      </h2>

      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Title
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          Your title introduces your proposal to the voters. Make sure it is
          clear and to the point.
        </p>
        <Input placeholder="Enter title of your proposal" />
      </div>
      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Description
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          Your description should present in full detail what the actions of the
          proposal will do. This is where voters will educate themselves on what
          they are voting on.
        </p>
        <Textarea
          placeholder="Add the proposal details here"
          inputClassName="md:h-32 xl:h-36"
        />
      </div>

      {/* Check if we have balance avaialable to spend */}
      <div className="mb-6 rounded-lg bg-white p-5 shadow-card transition-shadow duration-200 hover:shadow-large dark:bg-light-dark xs:p-6 xs:pb-8">
        <h3 className="mb-2 text-base font-medium dark:text-gray-100 xl:text-lg">
          Spend some money
        </h3>
        <p className="mb-5 leading-[1.8] dark:text-gray-300">
          This section is for crafting a proposal that involves spending some
          funds. Please specify the amount to be spent and provide a detailed
          explanation of how the funds will be used. Remember, voters will be
          considering the value and impact of your proposal based on this
          information.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3">
          <div className="mb-4 flex">
            <div className="flex-grow">
              {inputs.map((input, index) => (
                <div
                  className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3"
                  key={index}
                >
                  <Input
                    type="text"
                    placeholder="Address"
                    inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
                  />
                  <Input
                    type="number"
                    placeholder="Amount in sats"
                    inputClassName="focus:!ring-0 placeholder:text-[#6B7280]"
                  />
                </div>
              ))}
            </div>
            <div className="ml-4 flex items-center">
              <Button
                size="mini"
                color="gray"
                shape="circle"
                variant="transparent"
                onClick={handleAddInput}
              >
                <Plus className="h-auto w-3" />
              </Button>
              {inputs.length > 1 && (
                <Button
                  size="mini"
                  color="gray"
                  shape="circle"
                  variant="transparent"
                  onClick={handleRemoveInput}
                  className="ml-2"
                >
                  <Minus className="h-auto w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button
          size="large"
          shape="rounded"
          fullWidth={true}
          className="xs:w-64 md:w-72"
        >
          Create Proposal
        </Button>
      </div>
    </section>
  );
};

export default CreateProposalPage;
