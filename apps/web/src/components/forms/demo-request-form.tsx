'use client';

import { FormEvent, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function DemoRequestForm({
  enterpriseCustom = false,
}: {
  enterpriseCustom?: boolean;
}) {
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [projects, setProjects] = useState('');
  const [users, setUsers] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [capacity, setCapacity] = useState('');
  const [features, setFeatures] = useState('');
  const [integrations, setIntegrations] = useState('');
  const [support, setSupport] = useState('');
  const [needs, setNeeds] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setError('');

    try {
      const response = await fetch(`${API_URL}/enterprise-requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company,
          email,
          projects,
          users: enterpriseCustom ? users : undefined,
          companySize: enterpriseCustom ? companySize : undefined,
          capacity: enterpriseCustom ? capacity : undefined,
          features: enterpriseCustom ? features : undefined,
          integrations: enterpriseCustom ? integrations : undefined,
          support: enterpriseCustom ? support : undefined,
          needs: enterpriseCustom
            ? needs
            : needs || 'Pedido de demonstração da plataforma Astra.',
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data && typeof data.message === 'string'
            ? data.message
            : 'Não foi possível enviar o pedido.',
        );
      }

      setStatus('success');
      setCompany('');
      setEmail('');
      setProjects('');
      setUsers('');
      setCompanySize('');
      setCapacity('');
      setFeatures('');
      setIntegrations('');
      setSupport('');
      setNeeds('');
    } catch (err) {
      setStatus('error');
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível enviar o pedido.',
      );
    }
  }

  if (status === 'success') {
    return (
      <div className="rounded-2xl border border-astra-200 bg-astra-50 p-6">
        <h2 className="text-xl font-semibold text-astra-950">
          Pedido recebido com sucesso
        </h2>
        <p className="mt-3 text-astra-700">
          Obrigado. A equipa Astra recebeu a informação e irá avaliar o seu pedido.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {status === 'error' && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="mb-2 block text-sm font-medium text-astra-900">
          Empresa
        </label>
        <input
          name="company"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          placeholder="Nome da empresa"
          required
          maxLength={200}
          className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-astra-900">
          Email profissional
        </label>
        <input
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="nome@empresa.pt"
          type="email"
          required
          maxLength={320}
          className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-astra-900">
          Número de obras
        </label>
        <input
          name="projects"
          value={projects}
          onChange={(event) => setProjects(event.target.value)}
          placeholder="Ex.: 12"
          maxLength={100}
          className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
        />
      </div>

      {enterpriseCustom && (
        <>
          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Número de utilizadores
            </label>
            <input
              name="users"
              value={users}
              onChange={(event) => setUsers(event.target.value)}
              placeholder="Ex.: 25"
              maxLength={100}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Dimensão da empresa
            </label>
            <input
              name="companySize"
              value={companySize}
              onChange={(event) => setCompanySize(event.target.value)}
              placeholder="Ex.: 50 colaboradores"
              maxLength={100}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Capacidade / volume de operação
            </label>
            <input
              name="capacity"
              value={capacity}
              onChange={(event) => setCapacity(event.target.value)}
              placeholder="Ex.: 30 obras em simultâneo"
              maxLength={100}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Funcionalidades pretendidas
            </label>
            <textarea
              name="features"
              value={features}
              onChange={(event) => setFeatures(event.target.value)}
              placeholder="Ex.: gestão de equipas, automação, analytics, workflows..."
              maxLength={2000}
              rows={4}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Integrações necessárias
            </label>
            <textarea
              name="integrations"
              value={integrations}
              onChange={(event) => setIntegrations(event.target.value)}
              placeholder="Ex.: ERP, contabilidade, API, ferramentas internas..."
              maxLength={2000}
              rows={4}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Necessidades de suporte
            </label>
            <input
              name="support"
              value={support}
              onChange={(event) => setSupport(event.target.value)}
              placeholder="Ex.: suporte prioritário, onboarding dedicado..."
              maxLength={100}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-astra-900">
              Outras necessidades
            </label>
            <textarea
              name="needs"
              value={needs}
              onChange={(event) => setNeeds(event.target.value)}
              placeholder="Descreva processos, equipas, ativos ou necessidades específicas."
              required
              minLength={10}
              maxLength={5000}
              rows={6}
              className="w-full rounded-xl border border-astra-200 px-4 py-3 outline-none focus:border-astra-900"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full rounded-xl bg-astra-900 px-5 py-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === 'loading'
          ? 'A enviar...'
          : enterpriseCustom
            ? 'Enviar pedido de avaliação'
            : 'Solicitar Demo'}
      </button>
    </form>
  );
}
